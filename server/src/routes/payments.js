import { Router } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { protect, customerOnly } from '../middleware/auth.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
const router=Router(); router.use(protect,customerOnly);
function gateway(){
  if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET) throw Object.assign(new Error('Razorpay credentials are not configured'),{status:503});
  return new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
}
router.post('/razorpay/order',async(req,res,next)=>{
  try{
    const cart=await Cart.findOne({user:req.user.id}).populate('items.product');
    if(!cart?.items.length)return res.status(400).json({message:'Cart is empty'});
    const amount=cart.items.reduce((sum,i)=>sum+i.product.price*i.quantity,0);
    const rp=await gateway().orders.create({amount:Math.round(amount*100),currency:'INR',receipt:`user_${req.user.id}_${Date.now()}`});
    const order=await Order.create({user:req.user.id,items:cart.items.map(i=>({product:i.product.id,name:i.product.name,image:i.product.images?.[0]||'',unitPrice:i.product.price,quantity:i.quantity})),shippingAddress:req.body.shippingAddress||{},subtotal:amount,total:amount,paymentMethod:'RAZORPAY',razorpayOrderId:rp.id});
    res.status(201).json({keyId:process.env.RAZORPAY_KEY_ID,razorpayOrderId:rp.id,amount:rp.amount,currency:rp.currency,orderId:order.id});
  }catch(e){next(e)}
});
router.post('/razorpay/verify',async(req,res,next)=>{
  try{
    const {razorpay_order_id,razorpay_payment_id,razorpay_signature,orderId}=req.body;
    const order=await Order.findOne({_id:orderId,user:req.user.id,razorpayOrderId:razorpay_order_id});
    if(!order)return res.status(404).json({message:'Order not found'});
    const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(razorpay_signature||'')))return res.status(400).json({message:'Payment signature verification failed'});
    order.paymentStatus='PAID';order.orderStatus='Confirmed';order.razorpayPaymentId=razorpay_payment_id;await order.save();
    const cart=await Cart.findOne({user:req.user.id});if(cart){cart.items=[];await cart.save();}
    res.json({message:'Payment verified',order});
  }catch(e){next(e)}
});
export default router;

import { Router } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, customerOnly } from '../middleware/auth.js';
const router=Router(); router.use(protect,customerOnly);
router.get('/my',async(req,res,next)=>{try{res.json(await Order.find({user:req.user.id}).sort({createdAt:-1}))}catch(e){next(e)}});
router.post('/',async(req,res,next)=>{
  const session=await mongoose.startSession();
  try {
    const {shippingAddress,paymentMethod='COD'}=req.body;
    if(!shippingAddress?.name||!shippingAddress?.line1||!shippingAddress?.city||!shippingAddress?.postalCode)
      return res.status(400).json({message:'Complete shipping address is required'});
    if(paymentMethod!=='COD') return res.status(400).json({message:'Use Razorpay payment flow for online orders'});
    let created;
    await session.withTransaction(async()=>{
      const cart=await Cart.findOne({user:req.user.id}).populate('items.product').session(session);
      if(!cart?.items.length) throw Object.assign(new Error('Cart is empty'),{status:400});
      let subtotal=0; const snapshots=[];
      for(const item of cart.items){
        const p=await Product.findOne({_id:item.product.id,isActive:true,stock:{$gte:item.quantity}}).session(session);
        if(!p) throw Object.assign(new Error(`Insufficient stock for ${item.product.name}`),{status:409});
        subtotal+=p.price*item.quantity;
        snapshots.push({product:p.id,name:p.name,image:p.images?.[0]||'',unitPrice:p.price,quantity:item.quantity});
        p.stock-=item.quantity; await p.save({session});
      }
      [created]=await Order.create([{user:req.user.id,items:snapshots,shippingAddress,subtotal,shipping:0,total:subtotal,paymentMethod:'COD'}],{session});
      cart.items=[]; await cart.save({session});
    });
    res.status(201).json(created);
  } catch(e){next(e)} finally{await session.endSession()}
});
export default router;

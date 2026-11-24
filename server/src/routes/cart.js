import { Router } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, customerOnly } from '../middleware/auth.js';
const router = Router();
router.use(protect, customerOnly);
router.get('/', async (req,res,next) => {
  try { const cart = await Cart.findOne({user:req.user.id}).populate('items.product'); res.json(cart || {items:[]}); }
  catch(e) { next(e); }
});
router.post('/items', async (req,res,next) => {
  try {
    const { productId, quantity=1 } = req.body;
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) return res.status(400).json({message:'Quantity must be 1–20'});
    const product = await Product.findOne({_id:productId,isActive:true});
    if (!product) return res.status(404).json({message:'Product not found'});
    if (product.stock < qty) return res.status(409).json({message:'Insufficient stock'});
    let cart = await Cart.findOne({user:req.user.id});
    if (!cart) cart = new Cart({user:req.user.id,items:[]});
    const item = cart.items.find(i => i.product.toString() === productId);
    if (item) item.quantity = Math.min(20, item.quantity + qty); else cart.items.push({product:productId,quantity:qty});
    await cart.save(); await cart.populate('items.product'); res.json(cart);
  } catch(e) { next(e); }
});
router.patch('/items/:productId', async (req,res,next) => {
  try {
    const qty=Number(req.body.quantity);
    if (!Number.isInteger(qty) || qty<1 || qty>20) return res.status(400).json({message:'Invalid quantity'});
    const cart=await Cart.findOne({user:req.user.id});
    if (!cart) return res.status(404).json({message:'Cart not found'});
    const item=cart.items.find(i=>i.product.toString()===req.params.productId);
    if (!item) return res.status(404).json({message:'Item not found'});
    const product=await Product.findById(req.params.productId);
    if (!product || product.stock<qty) return res.status(409).json({message:'Insufficient stock'});
    item.quantity=qty; await cart.save(); await cart.populate('items.product'); res.json(cart);
  } catch(e) { next(e); }
});
router.delete('/items/:productId', async (req,res,next) => {
  try {
    const cart=await Cart.findOne({user:req.user.id});
    if (!cart) return res.json({items:[]});
    cart.items=cart.items.filter(i=>i.product.toString()!==req.params.productId);
    await cart.save(); await cart.populate('items.product'); res.json(cart);
  } catch(e) { next(e); }
});
export default router;

import { Router } from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect, customerOnly } from '../middleware/auth.js';
const router=Router(); router.use(protect,customerOnly);
router.get('/',async(req,res,next)=>{try{const w=await Wishlist.findOne({user:req.user.id}).populate('products');res.json(w?.products||[])}catch(e){next(e)}});
router.post('/:productId',async(req,res,next)=>{try{const p=await Product.findOne({_id:req.params.productId,isActive:true});if(!p)return res.status(404).json({message:'Product not found'});const w=await Wishlist.findOneAndUpdate({user:req.user.id},{$addToSet:{products:p.id}},{upsert:true,new:true}).populate('products');res.json(w.products)}catch(e){next(e)}});
router.delete('/:productId',async(req,res,next)=>{try{const w=await Wishlist.findOneAndUpdate({user:req.user.id},{$pull:{products:req.params.productId}},{new:true}).populate('products');res.json(w?.products||[])}catch(e){next(e)}});
export default router;

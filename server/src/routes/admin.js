import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
const router = Router();
router.use(protect, adminOnly);
router.get('/stats', async (_req, res, next) => {
  try {
    const [products, customers, orders, pendingOrders, deliveredOrders, revenueAgg, recentOrders] = await Promise.all([
      Product.countDocuments({ isActive: true }), User.countDocuments({ role: 'customer', isActive: true }), Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ['Pending', 'Confirmed', 'Processing'] } }), Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.aggregate([{ $match: { paymentStatus: 'PAID' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(6)
    ]);
    res.json({ products, customers, orders, pendingOrders, deliveredOrders, revenue: revenueAgg[0]?.total || 0, recentOrders });
  } catch (e) { next(e); }
});
router.get('/products', async (_req,res,next) => { try { res.json(await Product.find().sort({createdAt:-1})); } catch(e) { next(e); } });
router.post('/products', async (req,res,next) => {
  try { const p = await Product.create({ ...req.body, price: Number(req.body.price), stock: Number(req.body.stock), images: Array.isArray(req.body.images) ? req.body.images : [] }); res.status(201).json(p); }
  catch(e) { next(e); }
});
router.patch('/products/:id', async (req,res,next) => { try { const p = await Product.findByIdAndUpdate(req.params.id, req.body, {new:true,runValidators:true}); if(!p) return res.status(404).json({message:'Product not found'}); res.json(p); } catch(e) { next(e); } });
router.delete('/products/:id', async (req,res,next) => { try { const p = await Product.findByIdAndUpdate(req.params.id,{isActive:false},{new:true}); if(!p) return res.status(404).json({message:'Product not found'}); res.json({message:'Product deactivated'}); } catch(e) { next(e); } });
router.get('/orders', async (_req,res,next) => { try { res.json(await Order.find().populate('user','name email').sort({createdAt:-1})); } catch(e) { next(e); } });
router.patch('/orders/:id/status', async (req,res,next) => {
  try { const allowed=['Pending','Confirmed','Processing','Shipped','Out for Delivery','Delivered','Cancelled','Returned','Refunded']; if(!allowed.includes(req.body.orderStatus)) return res.status(400).json({message:'Invalid status'}); const o=await Order.findByIdAndUpdate(req.params.id,{orderStatus:req.body.orderStatus},{new:true}).populate('user','name email'); if(!o) return res.status(404).json({message:'Order not found'}); res.json(o); }
  catch(e) { next(e); }
});
export default router;

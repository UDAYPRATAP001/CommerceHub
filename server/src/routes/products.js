import { Router } from 'express';
import Product from '../models/Product.js';
const router = Router();
router.get('/', async (req,res,next) => {
  try {
    const { q, category, sort='newest', page=1, limit=12 } = req.query;
    const filter = { isActive:true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search:q };
    const sortMap = { newest:{createdAt:-1}, price_asc:{price:1}, price_desc:{price:-1}, rating:{rating:-1} };
    const p = Math.max(1, Number(page)), l = Math.min(48, Math.max(1, Number(limit)));
    const [items,total] = await Promise.all([
      Product.find(filter).sort(sortMap[sort] || sortMap.newest).skip((p-1)*l).limit(l),
      Product.countDocuments(filter)
    ]);
    res.json({ items, page:p, pages:Math.ceil(total/l), total });
  } catch(e) { next(e); }
});
router.get('/:id', async (req,res,next) => {
  try {
    const item = await Product.findOne({ _id:req.params.id, isActive:true });
    if (!item) return res.status(404).json({ message:'Product not found' });
    res.json(item);
  } catch(e) { next(e); }
});
export default router;

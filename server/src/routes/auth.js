import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { makeToken } from '../utils/token.js';
import { protect } from '../middleware/auth.js';
const router = Router();
const publicUser = user => ({ id:user.id, name:user.name, email:user.email, role:user.role });
router.post('/register', async (req,res,next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || (password || '').length < 8)
      return res.status(400).json({ message: 'Enter a name, valid email and password of at least 8 characters' });
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name:name.trim(), email:normalizedEmail, passwordHash:await bcrypt.hash(password,12) });
    res.status(201).json({ token:makeToken(user.id), user:publicUser(user) });
  } catch(e) { next(e); }
});
async function authenticate(req,res,next,adminRequired=false) {
  try {
    const user = await User.findOne({ email:(req.body.email || '').trim().toLowerCase() });
    if (!user || !user.isActive || !await bcrypt.compare(req.body.password || '', user.passwordHash))
      return res.status(401).json({ message:'Invalid email or password' });
    if (adminRequired && user.role !== 'admin') return res.status(403).json({ message:'This account does not have administrator access' });
    res.json({ token:makeToken(user.id), user:publicUser(user) });
  } catch(e) { next(e); }
}
router.post('/login', (req,res,next) => authenticate(req,res,next,false));
router.post('/admin/login', (req,res,next) => authenticate(req,res,next,true));
router.get('/me', protect, (req,res) => res.json({ user:req.user }));
export default router;

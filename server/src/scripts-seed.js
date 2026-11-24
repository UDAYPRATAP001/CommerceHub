import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';

const demoProducts = [
  { name:'Studio Wireless Headphones', brand:'Aural', category:'Electronics', description:'Comfortable over-ear wireless headphones with rich sound, soft cushions and long battery life.', price:3499, compareAtPrice:4999, stock:28, rating:4.7, images:['https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=900'] },
  { name:'Everyday Minimal Backpack', brand:'Northline', category:'Accessories', description:'A clean, durable everyday backpack with a padded laptop sleeve and practical storage.', price:1899, compareAtPrice:2499, stock:42, rating:4.6, images:['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900'] },
  { name:'Ceramic Pour-over Set', brand:'Form & Field', category:'Home', description:'A thoughtfully designed ceramic pour-over set for a slower, better morning coffee ritual.', price:1299, compareAtPrice:1599, stock:19, rating:4.8, images:['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900'] },
  { name:'Classic Analog Watch', brand:'Meridian', category:'Accessories', description:'A versatile minimalist watch with a timeless dial and comfortable everyday strap.', price:2799, compareAtPrice:3499, stock:15, rating:4.5, images:['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900'] },
  { name:'Cotton Everyday T-shirt', brand:'Common Thread', category:'Fashion', description:'A soft, breathable cotton tee with an easy fit for everyday wear.', price:699, compareAtPrice:999, stock:65, rating:4.4, images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900'] },
  { name:'Desk Task Lamp', brand:'Luma', category:'Home', description:'An adjustable desk lamp that brings warm, focused light to your workspace.', price:1599, compareAtPrice:1999, stock:23, rating:4.6, images:['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900'] },
  { name:'Stainless Steel Bottle', brand:'Daywell', category:'Lifestyle', description:'A reusable insulated bottle designed to keep drinks at the right temperature on the go.', price:899, compareAtPrice:1199, stock:54, rating:4.5, images:['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900'] },
  { name:'Portable Bluetooth Speaker', brand:'Aural', category:'Electronics', description:'Compact portable audio with clear sound, simple controls and a travel-friendly design.', price:2199, compareAtPrice:2999, stock:31, rating:4.7, images:['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900'] },
  { name:'Leather Card Holder', brand:'Northline', category:'Accessories', description:'A slim card holder with a refined finish and room for daily essentials.', price:799, compareAtPrice:1099, stock:38, rating:4.3, images:['https://images.unsplash.com/photo-1627123424574-724758594e93?w=900'] },
  { name:'Modern Table Vase', brand:'Form & Field', category:'Home', description:'A sculptural vase that adds a subtle accent to shelves, desks and dining spaces.', price:999, compareAtPrice:1399, stock:17, rating:4.6, images:['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=900'] }
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Add it to server/.env first.');
  await mongoose.connect(process.env.MONGODB_URI);
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!email || password.length < 12) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in server/.env before seeding.');
  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({ name: process.env.ADMIN_NAME || 'CommerceHub Admin', email, passwordHash: await bcrypt.hash(password, 12), role: 'admin' });
    console.log(`Created admin account: ${email}`);
  } else {
    admin.role = 'admin';
    admin.isActive = true;
    if (process.env.RESET_ADMIN_PASSWORD === 'true') admin.passwordHash = await bcrypt.hash(password, 12);
    await admin.save();
    console.log(`Admin account already exists; ensured admin role: ${email}`);
  }
  let created = 0;
  for (const product of demoProducts) {
    const exists = await Product.findOne({ name: product.name });
    if (!exists) { await Product.create(product); created += 1; }
  }
  console.log(`Seed complete. Added ${created} demo products; ${demoProducts.length - created} already existed.`);
  await mongoose.disconnect();
}
seed().catch(async error => { console.error('Seed failed:', error.message); await mongoose.disconnect().catch(()=>{}); process.exit(1); });

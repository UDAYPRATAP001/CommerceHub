import React from 'react';
import {Card,CardMedia,CardContent,Typography,Button,Stack,Chip} from '@mui/material';
import {Link,useNavigate} from 'react-router-dom';
import {useSelector} from 'react-redux';
import api from '../api.js';
export default function ProductCard({product}) {
  const user = useSelector(s => s.auth.user);
  const navigate = useNavigate();

  async function addToCart() {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') return;
    try {
      await api.post('/cart/items', {productId:product._id, quantity:1});
      window.dispatchEvent(new Event('cart-updated'));
      navigate('/cart');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Could not add item to cart');
    }
  }

  return <Card className="product-card"><CardMedia component="img" image={product.images?.[0]||'https://placehold.co/700x520?text=Product'} alt={product.name} sx={{height:210,objectFit:'cover'}}/><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center"><Chip size="small" label={product.category||'Featured'}/><Typography variant="caption" color="text.secondary">{product.stock>0?'In stock':'Sold out'}</Typography></Stack><Typography variant="h6" sx={{mt:1,fontWeight:800}}>{product.name}</Typography><Typography color="text.secondary" sx={{minHeight:42}}>{product.description?.slice(0,72)}</Typography><Typography variant="h6" fontWeight={800} sx={{mt:2}}>₹{product.price?.toLocaleString('en-IN')}</Typography><Stack direction="row" spacing={1} sx={{mt:2}}><Button component={Link} to={`/products/${product._id}`} variant="outlined" fullWidth>View item</Button><Button variant="contained" fullWidth disabled={!product.stock || user?.role==='admin'} onClick={addToCart}>Add to cart</Button></Stack></CardContent></Card>}

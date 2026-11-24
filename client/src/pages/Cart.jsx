import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, IconButton, TextField, Divider, Alert, Grid, Paper } from '@mui/material';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import api from '../api.js';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const user = useSelector(s => s.auth.user);
  const nav = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [err, setErr] = useState('');
  const [placing, setPlacing] = useState(false);
  const [address, setAddress] = useState({ name: user?.name || '', phone: '', line1: '', city: '', state: '', postalCode: '' });

  async function load() {
    try {
      const { data } = await api.get('/cart');
      setCart(data);
      setErr('');
      window.dispatchEvent(new Event('cart-updated'));
    } catch (e) {
      setErr(e.response?.data?.message || 'Sign in as a customer to view your cart');
    }
  }

  useEffect(() => {
    if (user?.role === 'customer') load();
    else setErr('Please sign in with a customer account to use the cart.');
  }, [user]);

  async function remove(id) {
    await api.delete(`/cart/items/${id}`);
    load();
  }

  async function update(id, quantity) {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return;
    await api.patch(`/cart/items/${id}`, { quantity });
    load();
  }

  async function placeOrder(event) {
    event.preventDefault();
    setPlacing(true);
    setErr('');
    try {
      await api.post('/orders', { shippingAddress: address, paymentMethod: 'COD' });
      window.dispatchEvent(new Event('cart-updated'));
      nav('/orders');
    } catch (e) {
      setErr(e.response?.data?.message || 'Could not place the order');
    } finally {
      setPlacing(false);
    }
  }

  const total = cart.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  return <Box className="container">
    <Typography variant="h3" fontWeight={900} sx={{ mb: 3 }}>Your cart</Typography>
    {err && <Alert severity="info" sx={{ mb: 2 }} action={!user ? <Button color="inherit" size="small" onClick={() => nav('/login')}>Sign in</Button> : null}>{err}</Alert>}
    {!cart.items.length && !err && <Box sx={{ py: 5, textAlign: 'center' }}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Your cart is empty.</Typography>
      <Button component={Link} variant="contained" to="/shop">Browse products</Button>
    </Box>}
    {cart.items.map(item => <Stack key={item.product?._id} direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ py: 2 }}>
      <img src={item.product?.images?.[0] || 'https://placehold.co/100'} width="92" height="78" alt={item.product?.name} style={{ objectFit: 'cover', borderRadius: 12 }} />
      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={800}>{item.product?.name}</Typography>
        <Typography color="text.secondary">₹{item.product?.price?.toLocaleString('en-IN')} each</Typography>
      </Box>
      <TextField size="small" type="number" label="Qty" value={item.quantity} inputProps={{ min: 1, max: 20 }} onChange={e => update(item.product._id, Number(e.target.value))} sx={{ width: 85 }} />
      <IconButton aria-label={`Remove ${item.product?.name}`} onClick={() => remove(item.product._id)}><DeleteOutline /></IconButton>
    </Stack>)}
    {cart.items.length > 0 && <Grid container spacing={3} sx={{ mt: 1 }}>
      <Grid item xs={12} md={7}>
        <Paper component="form" onSubmit={placeOrder} className="address-form" sx={{ width: '100%', boxShadow: 'none', border: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight={800}>Delivery address</Typography>
          {[
            ['name', 'Full name'], ['phone', 'Phone number'], ['line1', 'Address line'],
            ['city', 'City'], ['state', 'State'], ['postalCode', 'Postal code']
          ].map(([key, label]) => <TextField key={key} label={label} required={key !== 'phone' && key !== 'state'} value={address[key]} onChange={e => setAddress({ ...address, [key]: e.target.value })} />)}
          <Button type="submit" variant="contained" disabled={placing}>{placing ? 'Placing order...' : 'Place COD order'}</Button>
        </Paper>
      </Grid>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight={900}>Order summary</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" justifyContent="space-between"><Typography>Items</Typography><Typography>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}><Typography>Subtotal</Typography><Typography>₹{total.toLocaleString('en-IN')}</Typography></Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}><Typography>Delivery</Typography><Typography>Free</Typography></Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" fontWeight={900}>Total: ₹{total.toLocaleString('en-IN')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Payment method: Cash on Delivery</Typography>
        </Paper>
      </Grid>
    </Grid>}
  </Box>;
}

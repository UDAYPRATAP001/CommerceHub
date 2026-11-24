import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Button, Alert, Chip, Divider } from '@mui/material';
import api from '../api.js';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function Orders() {
  const user = useSelector(s => s.auth.user);
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState('');

  async function load() {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data);
      setMsg('');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Could not load orders');
    }
  }

  useEffect(() => {
    if (user?.role === 'customer') load();
    else setMsg('Sign in as a customer to track your orders.');
  }, [user]);

  const statusColor = status => status === 'Delivered'
    ? 'success'
    : status === 'Cancelled'
      ? 'error'
      : 'primary';

  return <Box className="container">
    <Typography variant="h3" fontWeight={900} sx={{ mb: 1 }}>My orders</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>Track every item you have placed.</Typography>
    {msg && <Alert sx={{ mb: 2 }} action={!user ? <Button component={Link} to="/login" color="inherit" size="small">Sign in</Button> : null}>{msg}</Alert>}
    {!orders.length && !msg && <Box sx={{ py: 5, textAlign: 'center' }}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>You have not placed any orders yet.</Typography>
      <Button component={Link} variant="contained" to="/shop">Start shopping</Button>
    </Box>}
    {orders.map(order => <Box key={order._id} sx={{ p: { xs: 2, md: 3 }, border: '1px solid #e7e7ef', borderRadius: 3, mb: 3, bgcolor: 'white' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Box>
          <Typography fontWeight={900}>Order #{order._id.slice(-7).toUpperCase()}</Typography>
          <Typography variant="body2" color="text.secondary">Placed {new Date(order.createdAt).toLocaleString()}</Typography>
        </Box>
        <Chip label={order.orderStatus} color={statusColor(order.orderStatus)} />
      </Stack>
      <Divider sx={{ my: 2 }} />
      {order.items?.map((item, index) => <Stack key={`${item.product || index}`} direction="row" spacing={2} alignItems="center" sx={{ py: 1 }}>
        <img src={item.image || 'https://placehold.co/80'} width="68" height="68" alt={item.name} style={{ objectFit: 'cover', borderRadius: 10 }} />
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={800}>{item.name}</Typography>
          <Typography variant="body2" color="text.secondary">Quantity: {item.quantity}</Typography>
        </Box>
        <Typography fontWeight={800}>₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}</Typography>
      </Stack>)}
      <Divider sx={{ my: 2 }} />
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Typography>Payment: {order.paymentMethod} · {order.paymentStatus}</Typography>
        <Typography variant="h6" fontWeight={900}>Total: ₹{order.total?.toLocaleString('en-IN')}</Typography>
      </Stack>
    </Box>)}
  </Box>;
}

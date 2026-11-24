import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Badge } from '@mui/material';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store.js';
import api from '../api.js';
export default function Header() {
  const user = useSelector(s => s.auth.user); const dispatch = useDispatch(); const nav = useNavigate();
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    async function loadCartCount() {
      if (user?.role !== 'customer') {
        setCartCount(0);
        return;
      }
      try {
        const { data } = await api.get('/cart');
        setCartCount(data.items?.reduce((total, item) => total + item.quantity, 0) || 0);
      } catch {
        setCartCount(0);
      }
    }
    loadCartCount();
    window.addEventListener('cart-updated', loadCartCount);
    return () => window.removeEventListener('cart-updated', loadCartCount);
  }, [user]);

  return <AppBar position="sticky" color="inherit" elevation={0} className="topbar"><Toolbar className="toolbar">
    <Typography component={Link} to="/" className="brand">commerce<span>hub.</span></Typography><Box sx={{flex:1}} />
    <Button component={Link} to="/shop" color="inherit">Shop</Button>
    {user?.role === 'customer' && <Button component={Link} to="/orders" color="inherit">My orders</Button>}
    {user?.role === 'admin' && <Button component={Link} to="/admin" color="primary">Dashboard</Button>}
    <Button component={Link} to="/cart" color="inherit" startIcon={<Badge badgeContent={cartCount} color="primary" overlap="circular"><ShoppingBagOutlined /></Badge>}>Cart</Button>
    {user ? <><Typography className="header-user" variant="body2">Hi, {user.name?.split(' ')[0]}</Typography><Button onClick={() => {dispatch(logout()); nav('/');}}>Log out</Button></> : <>
      <Button component={Link} to="/login" color="inherit">Sign in</Button>
      <Button component={Link} to="/register" variant="contained">Create account</Button>
    </>}
  </Toolbar></AppBar>;
}

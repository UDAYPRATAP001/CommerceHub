import React from 'react';
import { Routes,Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Cart from './pages/Cart.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';
function NotFound(){return <Box className="container"><h2>Page not found</h2><p>The page you're looking for doesn't exist.</p></Box>}
export default function App(){return <><Header/><main className="app-main"><Routes><Route path="/" element={<Home/>}/><Route path="/shop" element={<Shop/>}/><Route path="/products/:id" element={<ProductDetails/>}/><Route path="/login" element={<Login/>}/><Route path="/admin/login" element={<Login adminOnly/>}/><Route path="/register" element={<Register/>}/><Route path="/cart" element={<Cart/>}/><Route path="/orders" element={<Orders/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes></main><Footer/></>}

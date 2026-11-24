import React,{useEffect,useState} from 'react';
import { Box, Button, Container, Divider, Grid, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../api.js';
export default function Footer(){
 const [serviceStatus,setServiceStatus]=useState('checking');
 useEffect(()=>{let active=true;api.get('/health').then(({data})=>{if(active)setServiceStatus(data.database==='connected'?'online':'database-offline');}).catch(()=>{if(active)setServiceStatus('offline');});return()=>{active=false;};},[]);
 const statusText=serviceStatus==='online'?'Store services online':serviceStatus==='database-offline'?'API online · Database disconnected':serviceStatus==='offline'?'Store API unavailable':'Checking store connection…';
 return <Box component="footer" className="site-footer"><Container maxWidth="lg"><Grid container spacing={4}>
  <Grid item xs={12} md={4}><Typography component={Link} to="/" className="brand footer-brand">commerce<span>hub.</span></Typography><Typography color="rgba(255,255,255,.65)" sx={{mt:2,maxWidth:320,lineHeight:1.8}}>Thoughtful everyday finds, a smoother way to shop, and products picked to make daily life a little better.</Typography><Typography variant="caption" sx={{display:'inline-block',mt:2,color:serviceStatus==='online'?'#9be7b0':'#ffd28a'}}>● {statusText}</Typography></Grid>
  <Grid item xs={6} sm={4} md={2}><Typography fontWeight={800} sx={{mb:2}}>Explore</Typography><Stack spacing={1}><MuiLink component={Link} to="/shop">Shop all</MuiLink><MuiLink component={Link} to="/">New arrivals</MuiLink><MuiLink component={Link} to="/cart">Your cart</MuiLink></Stack></Grid>
  <Grid item xs={6} sm={4} md={2}><Typography fontWeight={800} sx={{mb:2}}>Your account</Typography><Stack spacing={1}><MuiLink component={Link} to="/login">Sign in</MuiLink><MuiLink component={Link} to="/register">Create account</MuiLink><MuiLink component={Link} to="/orders">Track orders</MuiLink><MuiLink component={Link} to="/admin/login">Admin sign in</MuiLink></Stack></Grid>
  <Grid item xs={12} sm={4} md={4}><Typography fontWeight={800} sx={{mb:2}}>Need help?</Typography><Typography color="rgba(255,255,255,.65)" sx={{lineHeight:1.8}}>Questions about an order or a product? Reach out to our store support team.</Typography><Button component="a" href="mailto:support@commercehub.example" variant="outlined" sx={{mt:2,color:'#fff',borderColor:'#ffffff66'}}>Contact support</Button></Grid>
 </Grid><Divider sx={{my:4,borderColor:'#ffffff22'}}/><Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" spacing={1}><Typography variant="body2" color="rgba(255,255,255,.55)">© {new Date().getFullYear()} CommerceHub. All rights reserved.</Typography><Typography variant="body2" color="rgba(255,255,255,.55)">Secure checkout · Customer-first shopping</Typography></Stack></Container></Box>
}

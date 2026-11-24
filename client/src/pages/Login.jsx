import React,{useState} from 'react';
import {Box,TextField,Button,Typography,Alert,Divider} from '@mui/material';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import {Link,useNavigate,useLocation} from 'react-router-dom';
import api from '../api.js';import {useDispatch} from 'react-redux';import {setAuth} from '../store.js';
export default function Login({adminOnly=false}) {
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const dispatch=useDispatch(),nav=useNavigate(),location=useLocation();
  async function submit(e){e.preventDefault();setErr('');setBusy(true);try{const {data}=await api.post(adminOnly?'/auth/admin/login':'/auth/login',{email,password});if(adminOnly&&data.user.role!=='admin'){setErr('This account does not have administrator access.');setBusy(false);return;}dispatch(setAuth(data));nav(data.user.role==='admin'?'/admin':(location.state?.from||'/'));}catch(e){setErr(e.response?.data?.message||'Login failed. Check the API connection.');}finally{setBusy(false);}}
  return <Box className="auth-wrap"><form onSubmit={submit} className="auth-card">
    {adminOnly&&<AdminPanelSettingsOutlined color="primary" sx={{fontSize:42}}/>}
    <Typography variant="h4" fontWeight={900}>{adminOnly?'Admin sign in':'Welcome back'}</Typography>
    <Typography color="text.secondary">{adminOnly?'Sign in with the administrator account configured for this store.':'Sign in to continue shopping.'}</Typography>
    {err&&<Alert severity="error">{err}</Alert>}
    <TextField label="Email address" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/>
    <TextField label="Password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>
    <Button type="submit" variant="contained" size="large" disabled={busy}>{busy?'Signing in…':adminOnly?'Sign in to dashboard':'Sign in'}</Button>
    <Divider />
    {adminOnly?<Typography variant="body2">Customer? <Link to="/login">Customer sign in</Link></Typography>:<><Typography>New here? <Link to="/register">Create an account</Link></Typography><Typography variant="body2">Store administrator? <Link to="/admin/login">Admin sign in</Link></Typography></>}
  </form></Box>;
}

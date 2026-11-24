import {configureStore,createSlice} from '@reduxjs/toolkit';
const authSlice=createSlice({name:'auth',initialState:{user:JSON.parse(localStorage.getItem('commerce_user')||'null')},reducers:{setAuth:(s,a)=>{s.user=a.payload.user;localStorage.setItem('commerce_user',JSON.stringify(a.payload.user));localStorage.setItem('commerce_token',a.payload.token)},logout:s=>{s.user=null;localStorage.removeItem('commerce_user');localStorage.removeItem('commerce_token')}}});
export const {setAuth,logout}=authSlice.actions;
export const store=configureStore({reducer:{auth:authSlice.reducer}});

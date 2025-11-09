import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Institute from './pages/Institute'
import Company from './pages/Company'
import Admin from './pages/Admin'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Role-based dashboards */}
        <Route path='/dashboard' element={<Dashboard />} />   {/* student */}
        <Route path='/institute' element={<Institute />} />
        <Route path='/company' element={<Company />} />
        <Route path='/admin' element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

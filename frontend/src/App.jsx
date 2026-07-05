import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdmin from './pages/SuperAdmin';
import POS from './pages/POS';
import Admin from './pages/Admin';
import Customer from './pages/Customer';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/super-admin" element={<SuperAdmin />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/customer" element={<Customer />} />
      </Routes>
    </Router>
  );
}

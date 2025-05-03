import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLoginPage from '../pages/admin/login_page.jsx';
import AdminDashboard from '../pages/admin/dashboard.jsx';
import Settings from '../pages/admin/settings_page.jsx';
import Specializations from '../pages/admin/specializations.jsx';
import Doctors from '../pages/admin/doctor_page.jsx';
import StaffNurses from '../pages/admin/staffnurses.jsx';


const AdminRoutes = () => (
  <Routes>
    <Route path="login" element={<AdminLoginPage />} />
    <Route path='dashboard' element={<AdminDashboard />} />
    <Route path='settings' element={<Settings />} />
    <Route path='specializations' element={<Specializations />} />
    <Route path="doctors" element={<Doctors />} />
    <Route path="staff-nurses" element={<StaffNurses/>} />
  
  </Routes>
);

export default AdminRoutes;
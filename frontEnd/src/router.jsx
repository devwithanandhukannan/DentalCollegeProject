import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminRoutes from './routers/Admin_Routes.jsx';
import DoctorRoutes from './routers/Doctor_Routes.jsx';
import PatientRoutes from './routers/Patient_Routes.jsx';
import StaffnurseRoutes from './routers/Staffnurse_Routes.jsx';
import LandingPage from './pages/Landing_page.jsx';
import LoginPage from './pages/Login_page.jsx';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="/admin/*" element={<AdminRoutes />} />
    <Route path="/doctor/*" element={<DoctorRoutes />} />
    <Route path="/patient/*" element={<PatientRoutes />} />
    <Route path="/staffnurse/*" element={<StaffnurseRoutes />} /> 
  </Routes>
);

export default AppRoutes;
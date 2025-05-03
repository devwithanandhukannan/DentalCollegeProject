import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StaffLogin from '../pages/staffnurse/StaffLogin.jsx';
import AssignedPatients from '../pages/staffnurse/AssignedPatients.jsx';
import StaffNurseDashboard from '../pages/staffnurse/StaffNurseDashboard.jsx';
import Settings from '../pages/staffnurse/Settings.jsx'
import CheckBiopsy from '../pages/staffnurse/checkBiopsy.jsx';
const PatientRoutes = () => (
  <Routes>
    <Route path="login" element={<StaffLogin />} />
    <Route path="assigned-patients" element={<AssignedPatients />} />
    <Route path="dashboard" element={<StaffNurseDashboard />} />
    <Route path="settings" element={<Settings />} />
    <Route path="checkBiopsy" element={<CheckBiopsy/>}/>
  </Routes>
);

export default PatientRoutes;
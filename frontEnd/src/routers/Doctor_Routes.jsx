import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DoctorLoginPage from '../pages/doctor/login_page.jsx';
import DoctorDashboard from '../pages/doctor/dashboard.jsx';
import Settings from '../pages/doctor/settings.jsx';
import Slots from '../pages/doctor/slots.jsx';
import Appointments from '../pages/doctor/appointments.jsx';
import AssignNurse from '../pages/doctor/assign_nurse.jsx';
import DoctorReports from '../pages/doctor/DoctorReports.jsx';

const DoctorRoutes = () => (
  <Routes>
    <Route path="login" element={<DoctorLoginPage />} />
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="settings" element={<Settings />} />
    <Route path="slots" element={<Slots />} />
    <Route path="appointments" element={<Appointments />} />
    <Route path="assign-nurse" element={<AssignNurse />} />
    <Route path="reports" element={<DoctorReports />} />
  </Routes>
);

export default DoctorRoutes;
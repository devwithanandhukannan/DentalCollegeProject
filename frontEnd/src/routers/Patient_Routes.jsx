import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PatientLoginPage from '../pages/patient/login_page.jsx';
import PatientDashboard from '../pages/patient/dashboard.jsx';
import PatientAppointments from '../pages/patient/appointments.jsx';
import PatientSettings from '../pages/patient/settings.jsx';
import PatientRegisterPage from '../pages/patient/register_page.jsx';
import PatientDoctors from '../pages/patient/doctors.jsx';

const PatientRoutes = () => (
  <Routes>
    <Route path="login" element={<PatientLoginPage />} />
    <Route path='dashboard' element={<PatientDashboard />} />
    <Route path='PatientAppointments' element={<PatientAppointments />} />
    <Route path="settings" element={<PatientSettings />} />
    <Route path='register' element={<PatientRegisterPage />} />
    <Route path='doctors' element={<PatientDoctors/>}/>
    <Route path='appointments' element={<PatientAppointments/>}/>
  </Routes>
);

export default PatientRoutes;
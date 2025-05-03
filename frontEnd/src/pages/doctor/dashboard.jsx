import React from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import { FaHome, FaFileAlt, FaCog, FaClock, FaCalendar, FaUserNurse } from 'react-icons/fa';

const DoctorDashboard = () => {
  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/doctor/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' }, // Placeholder
    { text: 'Reports', icon: <FaFileAlt />, to: '/doctor/reports' }, // Placeholder
    { text: 'Settings', icon: <FaCog />, to: '/doctor/settings' },
    { text: 'Slots', icon: <FaClock />, to: '/doctor/slots' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' },
    { text: 'Assign Nurse', icon: <FaUserNurse />, to: '/doctor/assign-nurse' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-3xl font-bold mb-4">Doctor Dashboard</h1>
          <p>Welcome to your dashboard, Doctor. Main content goes here.</p>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
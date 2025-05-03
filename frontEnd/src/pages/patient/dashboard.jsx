import React from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import { FaHome, FaCalendar, FaCog, FaUserMd } from 'react-icons/fa';

const PatientDashboard = () => {
  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/patient/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/patient/appointments' },
    { text: 'Settings', icon: <FaCog />, to: '/patient/settings' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/patient/doctors' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-3xl font-bold mb-4">Patient Dashboard</h1>
          <p>Welcome to your dashboard! Here you can manage your appointments and profile.</p>
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
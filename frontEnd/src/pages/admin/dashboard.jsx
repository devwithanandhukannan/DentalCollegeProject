import React from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaStethoscope, FaUserMd, FaUserNurse } from 'react-icons/fa';

const AdminDashboard = () => {
  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/admin/dashboard' },
    { text: 'Settings', icon: <FaCog />, to: '/admin/settings' },
    { text: 'Specializations', icon: <FaStethoscope />, to: '/admin/specializations' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/admin/doctors' },
    { text: 'Staff Nurses', icon: <FaUserNurse />, to: '/admin/staff-nurses' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p>Welcome to the admin dashboard. Main content goes here.</p>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaFileAlt, FaCog, FaClock, FaCalendar, FaUserNurse } from 'react-icons/fa';

const Settings = () => {
  const [doctorDetails, setDoctorDetails] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/doctor/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' }, // Placeholder
    { text: 'Reports', icon: <FaFileAlt />, to: '/doctor/reports' }, // Placeholder
    { text: 'Settings', icon: <FaCog />, to: '/doctor/settings' },
    { text: 'Slots', icon: <FaClock />, to: '/doctor/slots' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' },
    { text: 'Assign Nurse', icon: <FaUserNurse />, to: '/doctor/assign-nurse' },
  ];

  // Fetch doctor details (assuming an endpoint like GET /doctor/details exists)
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await api.get('/doctor/details'); // Placeholder endpoint
        setDoctorDetails(response.data);
        setName(response.data.name || '');
        setEmail(response.data.email || '');
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load doctor details');
      }
    };
    fetchDoctorDetails();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const updateData = {};
      if (name && name !== doctorDetails.name) updateData.name = name;
      if (email && email !== doctorDetails.email) updateData.email = email;
      if (oldPassword && newPassword) {
        updateData.oldPassword = oldPassword;
        updateData.newPassword = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setError('No changes to update');
        return;
      }

      const response = await api.put('/doctor/update-profile', updateData);
      setDoctorDetails(response.data.doctor);
      setSuccess('Profile updated successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="oldPassword">
                  Old Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
              >
                Update Profile
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
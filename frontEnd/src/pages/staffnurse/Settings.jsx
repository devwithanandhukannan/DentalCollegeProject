import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaUsers, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/staffnurse/dashboard' },
    { text: 'Assigned Patients', icon: <FaUsers />, to: '/staffnurse/assigned-patients' },
    { text: 'Settings', icon: <FaCog />, to: '/staffnurse/settings' },
    { text: 'checkBio', icon: <FaCog />, to: '/staffnurse/checkBiopsy' },
  ];

  // Fetch current profile data
  const fetchProfile = async () => {
    try {
      const response = await api.get('/staffnurse/profile');
      console.log(response.data);
      setFormData({ name: response.data.name, email: response.data.email, password: '' });
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load profile data');
      if (err.response?.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/staffnurse/login');
      }
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/staffnurse/update-profile', formData);
      setSuccess(response.data.msg || 'Profile updated successfully');
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
      if (err.response?.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/staffnurse/login');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/staffnurse/logout');
      localStorage.removeItem('staffToken');
      navigate('/staffnurse/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" handleLogout={handleLogout} />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between mb-6">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="password">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
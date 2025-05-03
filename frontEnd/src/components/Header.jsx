import React, { useState } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa';

const Header = ({ companyName = 'MEDCARE' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const tokenKeys = {
      doctor: 'doctorToken',
      staff: 'staffToken',
      patient: 'patientToken',
      admin: 'adminToken',
    };

    let token;
    if (config.url.startsWith('/doctor')) {
      token = localStorage.getItem(tokenKeys.doctor);
    } else if (config.url.startsWith('/staff')) {
      token = localStorage.getItem(tokenKeys.staff);
    } else if (config.url.startsWith('/patient')) {
      token = localStorage.getItem(tokenKeys.patient);
    } else if (config.url.startsWith('/admin')) {
      token = localStorage.getItem(tokenKeys.admin);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleLogout = async () => {
    const tokenKeys = {
      doctor: 'doctorToken',
      staff: 'staffToken',
      patient: 'patientToken',
      admin: 'adminToken',
    };

    try {
      // Store which token exists before removal
      const activeTokens = {
        admin: localStorage.getItem(tokenKeys.admin),
        doctor: localStorage.getItem(tokenKeys.doctor),
        staff: localStorage.getItem(tokenKeys.staff),
        patient: localStorage.getItem(tokenKeys.patient),
      };

      // Remove all tokens from localStorage first
      Object.values(tokenKeys).forEach(key => localStorage.removeItem(key));

      // Make appropriate logout request based on which token existed
      if (activeTokens.admin) {
        await api.post('/admin/logout');
      } else if (activeTokens.doctor) {
        await api.post('/doctor/logout');
      } else if (activeTokens.staff) {
        await api.post('/staffnurse/logout');
      } else if (activeTokens.patient) {
        await api.post('/patient/logout');
      }

      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Optional: Restore tokens if logout fails
      // Object.entries(activeTokens).forEach(([key, value]) => {
      //   if (value) localStorage.setItem(tokenKeys[key], value);
      // });
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold">{companyName}</div>
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none"
        >
          <FaUserCircle size={28} />
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg">
            <ul className="py-2">
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
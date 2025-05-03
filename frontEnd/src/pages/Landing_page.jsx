import React, { useState } from 'react';
import { FaHospital, FaUserMd, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('patientToken'));

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const tokenKeys = {
      patient: 'patientToken',
    };
    let token;
    if (config.url.startsWith('/patient')) {
      token = localStorage.getItem(tokenKeys.patient);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleLogout = async () => {
    try {
      console.log('clicked');
      localStorage.removeItem('patientToken');
      location.reload();
      setIsLoggedIn(false);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDiscoverClick = () => {
    if (!isLoggedIn) {
      window.location.href = `${window.location.href}patient/login`;
    } else {
      console.log('User is logged in, proceed with discovery');
    }
  };

  const handleLoginClick = () => {
    window.location.href = `/patient/login`;
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-800">MediLearn</h1>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li><a href="#home" className="text-gray-600 hover:text-blue-600">Home</a></li>
                <li><a href="#about" className="text-gray-600 hover:text-blue-600">About</a></li>
                <li><a href="#services" className="text-gray-600 hover:text-blue-600">Services</a></li>
              </ul>
            </nav>
            {/* Account Text with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none font-medium"
              >
                Account
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg z-10">
                  <ul className="py-2">
                    {!isLoggedIn ? (
                      <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={handleLoginClick}
                      >
                        Login
                      </li>
                    ) : (
                      <>
                        <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => window.location.href = '/patient/settings'}>
                          Profile
                        </li>
                        <li
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={handleLogout}
                        >
                          Logout
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Cover Image */}
      <section 
        id="home" 
        className="relative h-[600px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.pexels.com/photos/4270362/pexels-photo-4270362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center text-white">
          <div>
            <h2 className="text-5xl font-bold mb-4">MediLearn College & Hospital</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Pioneering medical education and healthcare innovation through advanced technology and compassionate care.
            </p>
            <button 
              onClick={handleDiscoverClick}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition"
            >
              Discover More
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Services</h3>
          <div className="grid grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <FaHospital className="text-blue-600 text-3xl mb-4" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Hospital Care</h4>
              <p className="text-gray-600">Advanced medical facilities for comprehensive healthcare.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <FaUserMd className="text-blue-600 text-3xl mb-4" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">AI Biopsy Prediction</h4>
              <p className="text-gray-600">Cutting-edge AI for precise biopsy region selection.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
              <FaCalendarAlt className="text-blue-600 text-3xl mb-4" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Medical Education</h4>
              <p className="text-gray-600">World-class training for future healthcare professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section with Two Divs */}
      <section id="about" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">About MediLearn</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h4>
              <p className="text-gray-600 leading-relaxed">
                MediLearn College & Hospital is dedicated to advancing medical education and patient care through innovative technology. Our state-of-the-art facilities combine academic excellence with practical healthcare delivery, training the next generation of medical professionals while providing top-tier treatment to our community.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h4 className="text-2xl font-semibold text-gray-800 mb-4">Our Innovation</h4>
              <p className="text-gray-600 leading-relaxed">
                At the forefront of medical technology, we've developed an AI-powered model that predicts the optimal regions for biopsies, enhancing diagnostic accuracy and patient outcomes. This groundbreaking tool is integrated into both our educational curriculum and hospital services, bridging the gap between research and real-world application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 MediLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
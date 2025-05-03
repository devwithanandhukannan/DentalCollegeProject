import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaCalendar, FaCog, FaUserMd } from 'react-icons/fa';

const PatientSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    oldPassword: '',
    newPassword: '',
  });
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    appointment_count: 0,
    patient_number: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/patient/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/patient/appointments' },
    { text: 'Settings', icon: <FaCog />, to: '/patient/settings' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/patient/doctors' },
  ];

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = {};

    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.length < 2) {
          newErrors.name = 'Name must be at least 2 characters long';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          newErrors.name = 'Name can only contain letters and spaces';
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        }
        break;

      case 'phone':
        if (value && !/^\+?[\d\s-]{10,}$/.test(value)) {
          newErrors.phone = 'Invalid phone number format';
        }
        break;

      case 'address':
        if (value && value.length < 5) {
          newErrors.address = 'Address must be at least 5 characters long';
        }
        break;

      case 'oldPassword':
        if (formData.newPassword && !value) {
          newErrors.oldPassword = 'Old password is required when changing password';
        }
        break;

      case 'newPassword':
        if (value) {
          if (value.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters long';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            newErrors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          }
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  // Fetch patient details
  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await api.get('/patient/details');
        const patient = response.data.patient || {};
        setPatientDetails(patient);
        setFormData({
          name: patient.name || '',
          email: patient.email || '',
          phone: patient.phone || '',
          address: patient.address || '',
          oldPassword: '',
          newPassword: '',
        });
      } catch (err) {
        window.location.href = '/patient/login';
        setErrors({ general: err.response?.data?.msg || 'Failed to load patient details' });
      }
    };
    fetchPatientDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Sanitize input
    const sanitizedValue = value.replace(/[<>{}]/g, '');
    
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate field and update errors
    const fieldErrors = validateField(name, sanitizedValue);
    setErrors((prev) => {
      const updatedErrors = { ...prev, ...fieldErrors };
      // Clear error if field is valid
      if (!fieldErrors[name]) {
        delete updatedErrors[name];
      }
      return updatedErrors;
    });
  };

  const validateForm = () => {
    const allErrors = {};
    Object.keys(formData).forEach((key) => {
      const fieldErrors = validateField(key, formData[key]);
      Object.assign(allErrors, fieldErrors);
    });
    
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors((prev) => ({ ...prev, general: '' }));
    setLoading(true);

    // Validate entire form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const updateData = {};
      if (formData.name && formData.name !== patientDetails.name) updateData.name = formData.name;
      if (formData.email && formData.email !== patientDetails.email) updateData.email = formData.email;
      if (formData.phone !== patientDetails.phone) updateData.phone = formData.phone;
      if (formData.address !== patientDetails.address) updateData.address = formData.address;
      if (formData.oldPassword && formData.newPassword) {
        updateData.oldPassword = formData.oldPassword;
        updateData.newPassword = formData.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setErrors({ general: 'No changes to update' });
        setLoading(false);
        return;
      }

      const response = await api.put('/patient/update-profile', updateData);
      setPatientDetails(response.data.patient);
      setSuccess('Profile updated successfully');
      setFormData((prev) => ({ ...prev, oldPassword: '', newPassword: '' }));
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-8 bg-gray-50 overflow-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Settings</h1>
          {errors.general && (
            <p className="text-red-600 bg-red-100 p-3 rounded-lg mb-6 animate-pulse">{errors.general}</p>
          )}
          {success && (
            <p className="text-green-600 bg-green-100 p-3 rounded-lg mb-6 animate-pulse">{success}</p>
          )}
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Update Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  disabled={loading}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  disabled={loading}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="oldPassword">
                  Old Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.oldPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  disabled={loading}
                />
                {errors.oldPassword && <p className="text-red-500 text-sm mt-1">{errors.oldPassword}</p>}
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full p-3 border ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                  disabled={loading}
                />
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>
              <button
                type="submit"
                className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-200 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                disabled={loading || Object.keys(errors).length > 0 || (!formData.name && !formData.email)}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientSettings;
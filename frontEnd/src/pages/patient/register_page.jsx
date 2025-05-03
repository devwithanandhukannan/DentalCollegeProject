import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/admin_Services/api.js';

const PatientRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    patient_number: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      case 'patient_number':
        if (value && !/^[A-Za-z0-9-]{1,}$/.test(value)) {
          newErrors.patient_number = 'Invalid patient number format';
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }
        // Check confirmPassword when password changes
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Confirm password is required';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors((prev) => ({ ...prev, general: '' }));
    setLoading(true);

    // Validate entire form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    // Exclude confirmPassword from API payload
    const { confirmPassword, ...apiData } = formData;
    
    try {
      const response = await api.post('/patient/register', apiData);
      setSuccess(response.data.msg);
      setTimeout(() => navigate('/patient/login'), 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message || 'Registration failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Patient Registration</h1>
        {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
        <form onSubmit={handleRegister}>
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
              className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={loading}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div className="mb-4" hidden>
            <label className="block text-gray-700 mb-2" htmlFor="patient_number">
              Patient Number (optional)
            </label>
            <input
              type="text"
              id="patient_number"
              name="patient_number"
              value={formData.patient_number}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.patient_number ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Leave blank for auto-generation"
              disabled={loading}
            />
            {errors.patient_number && <p className="text-red-500 text-sm mt-1">{errors.patient_number}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
              disabled={loading}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          <button
            type="submit"
            className={`w-full p-2 rounded transition duration-200 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            disabled={loading || Object.keys(errors).length > 0 || !formData.name || !formData.email || !formData.password || !formData.confirmPassword}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Already have an account? <a href="/patient/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default PatientRegisterPage;
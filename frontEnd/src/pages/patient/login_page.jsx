import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/admin_Services/api.js';

const PatientLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = {};

    switch (name) {
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors((prev) => ({ ...prev, general: '' }));

    // Validate entire form
    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.post('/patient/login', formData);
      localStorage.setItem('patientToken', response.data.token);
      setSuccess(response.data.msg);
      setTimeout(() => navigate('/patient/dashboard'), 1000);
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Login failed' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Patient Login</h1>
        {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
        {success && <p className="text-green-500 mb-4 text-center">{success}</p>}
        <form onSubmit={handleLogin}>
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
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <div className="mb-6">
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
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={Object.keys(errors).length > 0 || !formData.email || !formData.password}
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          Don’t have an account? <a href="/patient/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default PatientLoginPage;
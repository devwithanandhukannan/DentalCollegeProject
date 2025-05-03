import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaStethoscope, FaUserMd, FaUserNurse } from 'react-icons/fa';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specSearchTerm, setSpecSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({ name: '', email: '', password: '', confirmPassword: '', specialization_id: '' });
  const [updateDoctor, setUpdateDoctor] = useState({ id: null, name: '', email: '', specialization_id: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/admin/dashboard' },
    { text: 'Settings', icon: <FaCog />, to: '/admin/settings' },
    { text: 'Specializations', icon: <FaStethoscope />, to: '/admin/specializations' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/admin/doctors' },
    { text: 'Staff Nurses', icon: <FaUserNurse />, to: '/admin/staff-nurses' },
  ];

  // Validation rules
  const validateField = (name, value, isAddModal = true) => {
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

      case 'password':
        if (isAddModal) {
          if (!value) {
            newErrors.password = 'Password is required';
          } else if (value.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
          } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
          }
          // Check confirmPassword when password changes
          if (newDoctor.confirmPassword && value !== newDoctor.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
        }
        break;

      case 'confirmPassword':
        if (isAddModal) {
          if (!value) {
            newErrors.confirmPassword = 'Confirm password is required';
          } else if (value !== newDoctor.password) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
        }
        break;

      case 'specialization_id':
        if (!value) {
          newErrors.specialization_id = 'Specialization is required';
        } else if (!specializations.some((spec) => spec.specialization_id === parseInt(value))) {
          newErrors.specialization_id = 'Invalid specialization selected';
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  const validateForm = (doctorData, isAddModal = true) => {
    const allErrors = {};
    const fields = isAddModal
      ? ['name', 'email', 'password', 'confirmPassword', 'specialization_id']
      : ['name', 'email', 'specialization_id'];
    
    fields.forEach((key) => {
      const fieldErrors = validateField(key, doctorData[key], isAddModal);
      Object.assign(allErrors, fieldErrors);
    });

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to load doctors' });
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/admin/specializations');
      setSpecializations(response.data);
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to load specializations' });
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpecializations = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(specSearchTerm.toLowerCase())
  );

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    // Sanitize inputs
    const sanitizedDoctor = {
      name: newDoctor.name.replace(/[<>{}]/g, ''),
      email: newDoctor.email.replace(/[<>{}]/g, ''),
      password: newDoctor.password.replace(/[<>{}]/g, ''),
      confirmPassword: newDoctor.confirmPassword.replace(/[<>{}]/g, ''),
      specialization_id: newDoctor.specialization_id,
    };

    // Validate form
    if (!validateForm(sanitizedDoctor, true)) {
      setLoading(false);
      setIsAddModalOpen(true);
      return;
    }

    // Exclude confirmPassword from API payload
    const { confirmPassword, ...apiData } = sanitizedDoctor;

    try {
      await api.post('/admin/doctors', apiData);
      setSuccess('Doctor added successfully');
      setIsAddModalOpen(false);
      setNewDoctor({ name: '', email: '', password: '', confirmPassword: '', specialization_id: '' });
      setSpecSearchTerm('');
      await fetchDoctors();
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to add doctor' });
      setIsAddModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    // Sanitize inputs
    const sanitizedDoctor = {
      name: updateDoctor.name.replace(/[<>{}]/g, ''),
      email: updateDoctor.email.replace(/[<>{}]/g, ''),
      specialization_id: updateDoctor.specialization_id,
    };

    // Validate form
    if (!validateForm(sanitizedDoctor, false)) {
      setLoading(false);
      setIsUpdateModalOpen(true);
      return;
    }

    try {
      await api.put(`/admin/doctors/${updateDoctor.id}`, sanitizedDoctor);
      setSuccess('Doctor updated successfully');
      setIsUpdateModalOpen(false);
      setSpecSearchTerm('');
      await fetchDoctors();
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to update doctor' });
      setIsUpdateModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (id, name, email, specialization_id) => {
    setUpdateDoctor({ id, name, email, specialization_id });
    setSpecSearchTerm('');
    setErrors({});
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await api.delete(`/admin/doctors/${id}`);
      setDoctors(doctors.filter((doc) => doc.doctor_id !== id));
      setSuccess('Doctor deleted successfully');
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to delete doctor' });
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name !== 'specialization_id' ? value.replace(/[<>{}]/g, '') : value;
    setNewDoctor((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate field in real-time
    const fieldErrors = validateField(name, sanitizedValue, true);
    setErrors((prev) => {
      const updatedErrors = { ...prev, ...fieldErrors };
      if (!fieldErrors[name]) {
        delete updatedErrors[name];
      }
      return updatedErrors;
    });
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name !== 'specialization_id' ? value.replace(/[<>{}]/g, '') : value;
    setUpdateDoctor((prev) => ({ ...prev, [name]: sanitizedValue }));
    
    // Validate field in real-time
    const fieldErrors = validateField(name, sanitizedValue, false);
    setErrors((prev) => {
      const updatedErrors = { ...prev, ...fieldErrors };
      if (!fieldErrors[name]) {
        delete updatedErrors[name];
      }
      return updatedErrors;
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-between mb-6">
            <div className="w-1/3">
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              New Doctor
            </button>
          </div>
          {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Doctors</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Specialization</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doc) => (
                    <tr key={doc.doctor_id} className="border-t">
                      <td className="p-3">{doc.doctor_id}</td>
                      <td className="p-3">{doc.name}</td>
                      <td className="p-3">{doc.email}</td>
                      <td className="p-3">
                        {specializations.find((spec) => spec.specialization_id === doc.specialization_id)?.name || 'N/A'}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => openUpdateModal(doc.doctor_id, doc.name, doc.email, doc.specialization_id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(doc.doctor_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">
                      No doctors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add New Doctor</h2>
            {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
            <form onSubmit={handleAddDoctor}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newDoctor.email}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newDoctor.password}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={newDoctor.confirmPassword}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  placeholder="Search specializations..."
                  value={specSearchTerm}
                  onChange={(e) => setSpecSearchTerm(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <select
                  name="specialization_id"
                  value={newDoctor.specialization_id}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.specialization_id ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                >
                  <option value="">Select Specialization</option>
                  {filteredSpecializations.map((spec) => (
                    <option key={spec.specialization_id} value={spec.specialization_id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {errors.specialization_id && <p className="text-red-500 text-sm mt-1">{errors.specialization_id}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Doctor Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Doctor</h2>
            {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
            <form onSubmit={handleUpdateDoctor}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="updateName">Name</label>
                <input
                  type="text"
                  id="updateName"
                  name="name"
                  value={updateDoctor.name}
                  onChange={handleUpdateChange}
                  className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="updateEmail">Email</label>
                <input
                  type="email"
                  id="updateEmail"
                  name="email"
                  value={updateDoctor.email}
                  onChange={handleUpdateChange}
                  className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  placeholder="Search specializations..."
                  value={specSearchTerm}
                  onChange={(e) => setSpecSearchTerm(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <select
                  name="specialization_id"
                  value={updateDoctor.specialization_id}
                  onChange={handleUpdateChange}
                  className={`w-full p-2 border ${errors.specialization_id ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                >
                  <option value="">Select Specialization</option>
                  {filteredSpecializations.map((spec) => (
                    <option key={spec.specialization_id} value={spec.specialization_id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {errors.specialization_id && <p className="text-red-500 text-sm mt-1">{errors.specialization_id}</p>}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`bg-blue-500 text-white px-4 py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
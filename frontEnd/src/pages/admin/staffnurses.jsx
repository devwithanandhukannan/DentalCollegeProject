import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaStethoscope, FaUserMd, FaUserNurse } from 'react-icons/fa';

const StaffNurses = () => {
  const [staffNurses, setStaffNurses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctorSearchTerm, setDoctorSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStaffNurse, setNewStaffNurse] = useState({ name: '', email: '', password: '', confirmPassword: '', assigned_doctor_id: '' });
  const [updateStaffNurse, setUpdateStaffNurse] = useState({ id: null, name: '', email: '', assigned_doctor_id: '' });
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
          if (newStaffNurse.confirmPassword && value !== newStaffNurse.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
        }
        break;

      case 'confirmPassword':
        if (isAddModal) {
          if (!value) {
            newErrors.confirmPassword = 'Confirm password is required';
          } else if (value !== newStaffNurse.password) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
        }
        break;

      case 'assigned_doctor_id':
        if (!value) {
          newErrors.assigned_doctor_id = 'Assigned doctor is required';
        } else if (!doctors.some((doc) => doc.doctor_id === parseInt(value))) {
          newErrors.assigned_doctor_id = 'Invalid doctor selected';
        }
        break;

      default:
        break;
    }

    return newErrors;
  };

  const validateForm = (nurseData, isAddModal = true) => {
    const allErrors = {};
    const fields = isAddModal
      ? ['name', 'email', 'password', 'confirmPassword', 'assigned_doctor_id']
      : ['name', 'email', 'assigned_doctor_id'];
    
    fields.forEach((key) => {
      const fieldErrors = validateField(key, nurseData[key], isAddModal);
      Object.assign(allErrors, fieldErrors);
    });

    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const fetchStaffNurses = async () => {
    try {
      const response = await api.get('/admin/staff-nurses');
      setStaffNurses(response.data);
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to load staff nurses' });
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors');
      setDoctors(response.data);
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to load doctors' });
    }
  };

  useEffect(() => {
    fetchStaffNurses();
    fetchDoctors();
  }, []);

  const filteredStaffNurses = staffNurses.filter((nurse) =>
    nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nurse.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(doctorSearchTerm.toLowerCase())
  );

  const handleAddStaffNurse = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    // Sanitize inputs
    const sanitizedNurse = {
      name: newStaffNurse.name.replace(/[<>{}]/g, ''),
      email: newStaffNurse.email.replace(/[<>{}]/g, ''),
      password: newStaffNurse.password.replace(/[<>{}]/g, ''),
      confirmPassword: newStaffNurse.confirmPassword.replace(/[<>{}]/g, ''),
      assigned_doctor_id: newStaffNurse.assigned_doctor_id,
    };

    // Validate form
    if (!validateForm(sanitizedNurse, true)) {
      setLoading(false);
      setIsAddModalOpen(true);
      return;
    }

    // Exclude confirmPassword from API payload
    const { confirmPassword, ...apiData } = sanitizedNurse;

    try {
      await api.post('/admin/staff-nurses', apiData);
      setSuccess('Staff nurse added successfully');
      setIsAddModalOpen(false);
      setNewStaffNurse({ name: '', email: '', password: '', confirmPassword: '', assigned_doctor_id: '' });
      setDoctorSearchTerm('');
      await fetchStaffNurses();
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to add staff nurse' });
      setIsAddModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStaffNurse = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setLoading(true);

    // Sanitize inputs
    const sanitizedNurse = {
      name: updateStaffNurse.name.replace(/[<>{}]/g, ''),
      email: updateStaffNurse.email.replace(/[<>{}]/g, ''),
      assigned_doctor_id: updateStaffNurse.assigned_doctor_id,
    };

    // Validate form
    if (!validateForm(sanitizedNurse, false)) {
      setLoading(false);
      setIsUpdateModalOpen(true);
      return;
    }

    try {
      await api.put(`/admin/staff-nurses/${updateStaffNurse.id}`, sanitizedNurse);
      setSuccess('Staff nurse updated successfully');
      setIsUpdateModalOpen(false);
      setDoctorSearchTerm('');
      await fetchStaffNurses();
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to update staff nurse' });
      setIsUpdateModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (id, name, email, assigned_doctor_id) => {
    setUpdateStaffNurse({ id, name, email, assigned_doctor_id });
    setDoctorSearchTerm('');
    setErrors({});
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff nurse?')) return;
    try {
      await api.delete(`/admin/staff-nurses/${id}`);
      setStaffNurses(staffNurses.filter((nurse) => nurse.nurse_id !== id));
      setSuccess('Staff nurse deleted successfully');
    } catch (err) {
      setErrors({ general: err.response?.data?.msg || 'Failed to delete staff nurse' });
    }
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name !== 'assigned_doctor_id' ? value.replace(/[<>{}]/g, '') : value;
    setNewStaffNurse((prev) => ({ ...prev, [name]: sanitizedValue }));
    
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
    const sanitizedValue = name !== 'assigned_doctor_id' ? value.replace(/[<>{}]/g, '') : value;
    setUpdateStaffNurse((prev) => ({ ...prev, [name]: sanitizedValue }));
    
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
                placeholder="Search staff nurses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              New Staff Nurse
            </button>
          </div>
          {errors.general && <p className="text-red-500 mb-4">{errors.general}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Staff Nurses</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Assigned Doctor</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffNurses.length > 0 ? (
                  filteredStaffNurses.map((nurse) => (
                    <tr key={nurse.nurse_id} className="border-t">
                      <td className="p-3">{nurse.nurse_id}</td>
                      <td className="p-3">{nurse.name}</td>
                      <td className="p-3">{nurse.email}</td>
                      <td className="p-3">
                        {doctors.find((doc) => doc.doctor_id === nurse.assigned_doctor_id)?.name || 'N/A'}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => openUpdateModal(nurse.nurse_id, nurse.name, nurse.email, nurse.assigned_doctor_id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(nurse.nurse_id)}
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
                      No staff nurses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Staff Nurse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add New Staff Nurse</h2>
            {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
            <form onSubmit={handleAddStaffNurse}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newStaffNurse.name}
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
                  value={newStaffNurse.email}
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
                  value={newStaffNurse.password}
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
                  value={newStaffNurse.confirmPassword}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Assigned Doctor</label>
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={doctorSearchTerm}
                  onChange={(e) => setDoctorSearchTerm(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <select
                  name="assigned_doctor_id"
                  value={newStaffNurse.assigned_doctor_id}
                  onChange={handleAddChange}
                  className={`w-full p-2 border ${errors.assigned_doctor_id ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                {errors.assigned_doctor_id && <p className="text-red-500 text-sm mt-1">{errors.assigned_doctor_id}</p>}
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

      {/* Update Staff Nurse Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Staff Nurse</h2>
            {errors.general && <p className="text-red-500 mb-4 text-center">{errors.general}</p>}
            <form onSubmit={handleUpdateStaffNurse}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="updateName">Name</label>
                <input
                  type="text"
                  id="updateName"
                  name="name"
                  value={updateStaffNurse.name}
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
                  value={updateStaffNurse.email}
                  onChange={handleUpdateChange}
                  className={`w-full p-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Assigned Doctor</label>
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={doctorSearchTerm}
                  onChange={(e) => setDoctorSearchTerm(e.target.value)}
                  className="w-full p-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <select
                  name="assigned_doctor_id"
                  value={updateStaffNurse.assigned_doctor_id}
                  onChange={handleUpdateChange}
                  className={`w-full p-2 border ${errors.assigned_doctor_id ? 'border-red-500' : 'border-gray-300'} rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  disabled={loading}
                >
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map((doc) => (
                    <option key={doc.doctor_id} value={doc.doctor_id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
                {errors.assigned_doctor_id && <p className="text-red-500 text-sm mt-1">{errors.assigned_doctor_id}</p>}
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

export default StaffNurses;
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaStethoscope, FaUserMd, FaUserNurse } from 'react-icons/fa';

const Specializations = () => {
  const [specializations, setSpecializations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newSpecName, setNewSpecName] = useState('');
  const [updateSpec, setUpdateSpec] = useState({ id: null, name: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/admin/dashboard' },
    { text: 'Settings', icon: <FaCog />, to: '/admin/settings' },
    { text: 'Specializations', icon: <FaStethoscope />, to: '/admin/specializations' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/admin/doctors' },
    { text: 'Staff Nurses', icon: <FaUserNurse />, to: '/admin/staff-nurses' },
  ];

  const fetchSpecializations = async () => {
    try {
      const response = await api.get('/admin/specializations');
      setSpecializations(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load specializations');
    }
  };

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const filteredSpecializations = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSpecialization = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/specializations', { name: newSpecName });
      setSuccess('Specialization added successfully');
      setIsAddModalOpen(false);
      setNewSpecName('');
      await fetchSpecializations();
    } catch (err) {
      setIsAddModalOpen(true);
      setError(err.response?.data?.msg || 'Failed to add specialization');
    }
  };

  const handleUpdateSpecialization = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/specializations/${updateSpec.id}`, {
        name: updateSpec.name,
      });
      setSuccess('Specialization updated successfully');
      setIsUpdateModalOpen(false);
      await fetchSpecializations();
    } catch (err) {
      setIsUpdateModalOpen(true);
      setError(err.response?.data?.msg || 'Failed to update specialization');
    }
  };

  const openUpdateModal = (id, name) => {
    setUpdateSpec({ id, name });
    setIsUpdateModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this specialization?')) return;
    try {
      await api.delete(`/admin/specializations/${id}`);
      setSpecializations(specializations.filter((spec) => spec.specialization_id !== id));
      setSuccess('Specialization deleted successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete specialization');
    }
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
                placeholder="Search specializations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              New Specialization
            </button>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Specializations</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSpecializations.length > 0 ? (
                  filteredSpecializations.map((spec) => (
                    <tr key={spec.specialization_id} className="border-t">
                      <td className="p-3">{spec.specialization_id}</td>
                      <td className="p-3">{spec.name}</td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => openUpdateModal(spec.specialization_id, spec.name)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(spec.specialization_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-3 text-center">
                      No specializations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add New Specialization</h2>
            <form onSubmit={handleAddSpecialization}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="specName">
                  Specialization Name
                </label>
                <input
                  type="text"
                  id="specName"
                  value={newSpecName}
                  onChange={(e) => setNewSpecName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Specialization</h2>
            <form onSubmit={handleUpdateSpecialization}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="updateSpecName">
                  Specialization Name
                </label>
                <input
                  type="text"
                  id="updateSpecName"
                  value={updateSpec.name}
                  onChange={(e) => setUpdateSpec({ ...updateSpec, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Specializations;
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaUsers, FaFileAlt, FaCog, FaStethoscope, FaUserMd, FaUserNurse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ report_id: '', status: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/admin/dashboard' },
    { text: 'Settings', icon: <FaCog />, to: '/admin/settings' },
    { text: 'Specializations', icon: <FaStethoscope />, to: '/admin/specializations' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/admin/doctors' },
    { text: 'Staff Nurses', icon: <FaUserNurse />, to: '/admin/staff-nurses' },
  ];

  // Axios interceptor for admin token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch all reports
  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load reports');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports by patient name
  const filteredReports = reports.filter((report) =>
    (report.Patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle status update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/admin/reports/status', formData);
      setSuccess(response.data.msg);
      setFormData({ report_id: '', status: '' });
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update status');
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
      }
    }
  };

  // Open modal with pre-filled report data
  const openStatusModal = (report) => {
    setFormData({ report_id: report.report_id, status: report.status });
    setIsModalOpen(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout');
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
                placeholder="Search by patient name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
            >
              Logout
            </button>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">All Reports</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Nurse</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.report_id} className="border-t">
                      <td className="p-3">{report.report_id}</td>
                      <td className="p-3">{report.Patient?.name || 'N/A'}</td>
                      <td className="p-3">{report.Doctor?.name || 'N/A'}</td>
                      <td className="p-3">{report.StaffNurse?.name || 'N/A'}</td>
                      <td className="p-3">{report.status}</td>
                      <td className="p-3">
                        <button
                          onClick={() => openStatusModal(report)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-200"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-3 text-center">
                      No reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Update Status Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Report Status</h2>
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Status --</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Resubmitted">Resubmitted</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
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

export default AdminReports;
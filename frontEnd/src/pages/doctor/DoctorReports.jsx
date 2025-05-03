import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaFileAlt, FaCog, FaClock, FaCalendar, FaUserNurse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/doctor/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' }, // Placeholder
    { text: 'Reports', icon: <FaFileAlt />, to: '/doctor/reports' }, // Placeholder
    { text: 'Settings', icon: <FaCog />, to: '/doctor/settings' },
    { text: 'Slots', icon: <FaClock />, to: '/doctor/slots' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' },
    { text: 'Assign Nurse', icon: <FaUserNurse />, to: '/doctor/assign-nurse' },
  ];

  // Axios interceptor for token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch reports
  const fetchReports = async () => {
    try {
      const response = await api.get('/doctor/reports');
      console.log('API Response:', response.data); // For debugging
      // Extract the reports array from the response
      const reportsData = Array.isArray(response.data.reports) ? response.data.reports : [];
      setReports(reportsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load reports');
      setReports([]);
      if (err.response?.status === 401) {
        localStorage.removeItem('doctorToken');
        navigate('/doctor/login');
      }
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filter reports
  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) =>
        (report.Patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (report.StaffNurse?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Open status update modal
  const openStatusModal = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  // Handle status update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
        console.log(selectedReport.report_id);
        console.log(newStatus);
        
      const response = await api.post('/doctor/reports/status', {
        report_id: selectedReport.report_id,
        status: newStatus,
      });
      setSuccess(response.data.msg);
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update status');
      if (err.response?.status === 401) {
        localStorage.removeItem('doctorToken');
        navigate('/doctor/login');
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/doctor/logout');
      localStorage.removeItem('doctorToken');
      navigate('/doctor/login');
    } catch (err) {
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
                placeholder="Search by patient or nurse name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">My Reports</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Nurse</th>
                  <th className="p-3">Content</th>
                  <th className="p-3">File</th>
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
                      <td className="p-3">{report.StaffNurse?.name || 'N/A'}</td>
                      <td className="p-3">{report.content || 'N/A'}</td>
                      <td className="p-3">
                        {report.file_path ? (
                          <a href={report.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            View File
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
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
                    <td colSpan="7" className="p-3 text-center">
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
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Report Status (ID: {selectedReport.report_id})</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleUpdateStatus}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Resubmitted">Resubmitted</option>
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

export default DoctorReports;
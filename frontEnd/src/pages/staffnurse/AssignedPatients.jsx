import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaUsers, FaFileAlt, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AssignedPatients = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [formData, setFormData] = useState({ report_id: '', content: '', file: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/staffnurse/dashboard' },
    { text: 'Assigned Patients', icon: <FaUsers />, to: '/staffnurse/assigned-patients' },
    { text: 'Settings', icon: <FaCog />, to: '/staffnurse/settings' },
    { text: 'checkBio', icon: <FaCog />, to: '/staffnurse/checkBiopsy' },
  ];

  // Fetch assigned patients
  const fetchAssignedPatients = async () => {
    try {
      const response = await api.get('/staffnurse/assigned-patients');
      console.log('Fetched Reports:', response.data);
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load assigned patients');
      if (err.response?.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/staffnurse/login');
      }
    }
  };

  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  // Filter reports by patient name
  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) =>
        (report.Patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    console.log(`Input Changed: ${name} = ${files ? files[0].name : value}`);
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // Handle sending report with file upload
  const handleSendReport = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('report_id', formData.report_id);
    data.append('content', formData.content);
    if (formData.file) data.append('file', formData.file);

    console.log('FormData Contents:');
    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value instanceof File ? value.name : value}`);
    }

    try {
      const response = await api.post('/staffnurse/send-report', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(response.data.msg || 'Report sent successfully');
      setFormData({ report_id: '', content: '', file: null });
      setCurrentReport(null);
      setIsModalOpen(false);
      fetchAssignedPatients();
    } catch (err) {
      console.error('Send Report Error:', err);
      setError(err.response?.data?.msg || 'Failed to send report');
      if (err.response?.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/staffnurse/login');
      }
    }
  };

  // Open modal with pre-filled report data
  const openReportModal = (report) => {
    setCurrentReport(report);
    setFormData({ report_id: report.report_id, content: report.content || '', file: null });
    setIsModalOpen(true);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.post('/staffnurse/logout');
      localStorage.removeItem('staffToken');
      navigate('/staffnurse/login');
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
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Assigned Patients</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Patient Number</th>
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
                      <td className="p-3">{report.Patient?.patient_number || 'N/A'}</td>
                      <td className="p-3">{report.status}</td>
                      <td className="p-3">
                        {(report.status === 'Pending' || report.status === 'Rejected' || report.status === 'Resubmitted') && (
                          <button
                            onClick={() => openReportModal(report)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                          >
                            {report.status === 'Pending' ? 'Send Report' : 'Resubmit Report'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-3 text-center">
                      No assigned patients found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Send Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {currentReport && (currentReport.status === 'Rejected' || currentReport.status === 'Resubmitted')
                ? 'Resubmit Report to Doctor'
                : 'Send Report to Doctor'}
            </h2>
            <form onSubmit={handleSendReport}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="content">
                  Report Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter report details..."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="file">
                  Upload Report File {currentReport && (currentReport.status === 'Rejected' || currentReport.status === 'Resubmitted') ? '(Required)' : '(Optional)'}
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={currentReport && (currentReport.status === 'Rejected' || currentReport.status === 'Resubmitted')}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentReport(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedPatients;
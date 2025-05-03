import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js'; // Assuming this is the correct path now
import { FaHome, FaFileAlt, FaCog, FaClock, FaCalendar, FaUserNurse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AssignNurse = () => {
  const [reports, setReports] = useState([]);
  const [patients, setPatients] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ patient_id: '', nurse_id: '', content: '', file: null });
  const [updateData, setUpdateData] = useState({ report_id: null, patient_id: '', nurse_id: '', content: '', file: null, status: '' });
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

  // Fetch data
  const fetchReports = async () => {
    try {
      const response = await api.get('/doctor/reports');
      setReports(Array.isArray(response.data.reports) ? response.data.reports : []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load reports');
      if (err.response?.status === 401) {
        localStorage.removeItem('doctorToken');
        navigate('/doctor/login');
      }
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctor/patients');
      setPatients(Array.isArray(response.data.patients) ? response.data.patients : []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load patients');
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await api.get('/doctor/assigned-nurses');
      setNurses(Array.isArray(response.data.staffNurses) ? response.data.staffNurses : []);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load nurses');
    }
  };

  useEffect(() => {
    fetchReports();
    fetchPatients();
    fetchNurses();
  }, []);

  // Filter reports
  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) =>
        (report.Patient?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (report.StaffNurse?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle form changes
  const handleChange = (e, isUpdate = false) => {
    const { name, value, files } = e.target;
    console.log(`Field Changed: ${name} = ${files ? files[0].name : value}`); // Debug log
    if (isUpdate) {
      setUpdateData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
    }
  };

  // Handle create submission
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('patient_id', formData.patient_id);
    data.append('nurse_id', formData.nurse_id);
    data.append('content', formData.content || '');
    
    if (formData.file) data.append('file', formData.file);

    try {
      const response = await api.post('/doctor/reports/allocate-nurse', data);
      setSuccess(response.data.msg);
      setFormData({ patient_id: '', nurse_id: '', content: '', file: null });
      setIsModalOpen(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to assign nurse');
      console.error('Submission Error:', err);
    }
  };

  // Handle update submission with status
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const data = new FormData();
    data.append('patient_id', updateData.patient_id);
    data.append('nurse_id', updateData.nurse_id);
    data.append('content', updateData.content || '');
    data.append('status', updateData.status); // Added status
    if (updateData.file) data.append('file', updateData.file);

    try {
      const response = await api.put(`/doctor/reports/${updateData.report_id}`, data);
      setSuccess(response.data.msg);
      setIsUpdateModalOpen(false);
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update report');
      console.error('Update Error:', err);
    }
  };

  // Handle delete
  const handleDelete = async (report_id) => {
    if (!confirm('Are you sure you want to delete this allocation?')) return;
    try {
      await api.delete(`/doctor/reports/${report_id}`);
      setSuccess('Nurse allocation deleted successfully');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete report');
    }
  };

  // Open update modal
  const openUpdateModal = (report) => {
    setUpdateData({
      report_id: report.report_id,
      patient_id: report.patient_id,
      nurse_id: report.nurse_id,
      content: report.content || '',
      file: null,
      status: report.status || 'Pending', // Initialize with current status
    });
    setIsUpdateModalOpen(true);
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
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              New Allocation
            </button>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Nurse Allocations</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Nurse</th>
                  <th className="p-3">Content</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Report</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    console.log(report),
                    
                    <tr key={report.report_id} className="border-t">
                      <td className="p-3">{report.report_id}</td>
                      <td className="p-3">{report.Patient?.name || 'N/A'}</td>
                      <td className="p-3">{report.StaffNurse?.name || 'N/A'}</td>
                      <td className="p-3">{report.content || 'N/A'}</td>
                      <td className="p-3">{report.status}</td>
                      <td className="p-3">
                        {report.file_path ? (
                          <a href={report.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                            View File
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => openUpdateModal(report)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(report.report_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-3 text-center">
                      No allocations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Create Allocation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Assign Nurse to Patient</h2>
            <form onSubmit={handleCreateSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="patient_id">
                  Select Patient
                </label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.name} ({patient.patient_number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="nurse_id">
                  Select Nurse
                </label>
                <select
                  id="nurse_id"
                  name="nurse_id"
                  value={formData.nurse_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Nurse --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.nurse_id} value={nurse.nurse_id}>
                      {nurse.name} ({nurse.email})
                    </option>
                  ))}
                </select>
              </div>
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
                />
              </div>
              <div className="mb-4" hidden>
                <label className="block text-gray-700 mb-2" htmlFor="file">
                  Upload File (Optional)
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Allocation Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Nurse Allocation (ID: {updateData.report_id})</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="patient_id">
                  Select Patient
                </label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={updateData.patient_id}
                  onChange={(e) => handleChange(e, true)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.name} ({patient.patient_number})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="nurse_id">
                  Select Nurse
                </label>
                <select
                  id="nurse_id"
                  name="nurse_id"
                  value={updateData.nurse_id}
                  onChange={(e) => handleChange(e, true)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Nurse --</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.nurse_id} value={nurse.nurse_id}>
                      {nurse.name} ({nurse.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="content">
                  Report Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={updateData.content}
                  onChange={(e) => handleChange(e, true)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter report details..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={updateData.status}
                  onChange={(e) => handleChange(e, true)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Resubmitted">Resubmitted</option>
                  <option value="Submitted">Submitted</option>
                </select>
              </div>
              <div className="mb-4" hidden>
                <label className="block text-gray-700 mb-2" htmlFor="file">
                  Upload New File (Optional)
                </label>
                <input
                  type="file"
                  id="file"
                  name="file"
                  onChange={(e) => handleChange(e, true)}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default AssignNurse;
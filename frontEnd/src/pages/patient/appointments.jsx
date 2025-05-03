import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaCalendar, FaCog, FaUserMd } from 'react-icons/fa';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/patient/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/patient/appointments' },
    { text: 'Settings', icon: <FaCog />, to: '/patient/settings' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/patient/doctors' },
  ];

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await api.get('/patient/appointments');
      console.log('Appointments:', response.data);
      setAppointments(response.data);
    } catch (err) {
      window.location.href='/patient/login';
      setError(err.response?.data?.msg || 'Failed to load appointments');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) =>
    (appt.Doctor?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (appt.Slot?.slot_date || '').includes(searchTerm)
  );

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointment_id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/patient/appointments/${appointment_id}/cancel`);
      setSuccess(response.data.msg);
      await fetchAppointments(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to cancel appointment');
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
                placeholder="Search by doctor or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.appointment_id} className="border-t">
                      <td className="p-3">{appt.appointment_id}</td>
                      <td className="p-3">{appt.Doctor?.name || 'N/A'}</td>
                      <td className="p-3">{appt.Slot?.slot_date || 'N/A'}</td>
                      <td className="p-3">{appt.slot_time || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`${
                            appt.status === 'Scheduled' ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="p-3">
                        {appt.status === 'Scheduled' && (
                          <button
                            onClick={() => handleCancelAppointment(appt.appointment_id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-3 text-center">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PatientAppointments;
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaFileAlt, FaCog, FaClock, FaCalendar, FaUserNurse } from 'react-icons/fa';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/doctor/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' }, // Placeholder
    { text: 'Reports', icon: <FaFileAlt />, to: '/doctor/reports' }, // Placeholder
    { text: 'Settings', icon: <FaCog />, to: '/doctor/settings' },
    { text: 'Slots', icon: <FaClock />, to: '/doctor/slots' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' },
    { text: 'Assign Nurse', icon: <FaUserNurse />, to: '/doctor/assign-nurse' },
  ];

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const response = await api.get('/doctor/appointments');
      setAppointments(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load appointments');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Handle search
  const filteredAppointments = appointments.filter((appt) =>
    appt.Patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    appt.slot_date.includes(searchTerm)
  );

  // Update appointment status
  const handleStatusUpdate = async (appointment_id, status) => {
    setError('');
    setSuccess('');
    try {
      const response = await api.put(`/doctor/appointments/${appointment_id}/status`, { status });
      setAppointments(
        appointments.map((appt) =>
          appt.appointment_id === appointment_id ? { ...appt, status: response.data.appointment.status } : appt
        )
      );
      setSuccess('Appointment status updated successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update status');
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
                placeholder="Search by patient name or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Appointments</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appt) => (
                    <tr key={appt.appointment_id} className="border-t">
                      <td className="p-3">{appt.appointment_id}</td>
                      <td className="p-3">{appt.Patient?.name || 'N/A'}</td>
                      <td className="p-3">{appt.Patient?.email || 'N/A'}</td>
                      <td className="p-3">{appt.Patient?.phone || 'N/A'}</td>
                      <td className="p-3">{appt.Slot?.slot_date || 'N/A'}</td>
                      <td className="p-3">{appt.slot_time || 'N/A'}</td>
                      <td className="p-3">
                        <select
                          value={appt.status}
                          onChange={(e) => handleStatusUpdate(appt.appointment_id, e.target.value)}
                          className="p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-3 text-center">
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

export default Appointments;
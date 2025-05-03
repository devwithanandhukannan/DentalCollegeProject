import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js'; // Adjust path if needed
import { FaHome, FaCalendar, FaCog, FaUserMd } from 'react-icons/fa';


const PatientDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({ doctor_id: '', slot_id: '', slot_time: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/patient/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/patient/appointments' },
    { text: 'Settings', icon: <FaCog />, to: '/patient/settings' },
    { text: 'Doctors', icon: <FaUserMd />, to: '/patient/doctors' },
  ];

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/patient/doctors');
      console.log('Doctors:', response.data.doctors);
      setDoctors(response.data.doctors);
    } catch (err) {
      window.location.href='/patient/login';
      setError(err.response?.data?.msg || 'Failed to load doctors');
    }
  };

  // Fetch slots for a specific doctor
  const fetchSlots = async (doctor_id) => {
    try {
      const response = await api.get(`/patient/doctor/slots?doctor_id=${doctor_id}`);
      console.log('Slots:', response.data);
      setSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load slots');
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Open booking modal
  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({ doctor_id: doctor.doctor_id, slot_id: '', slot_time: '' });
    fetchSlots(doctor.doctor_id);
    setIsModalOpen(true);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle booking submission
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/patient/appointments', formData);
      setSuccess(response.data.msg);
      setFormData({ doctor_id: '', slot_id: '', slot_time: '' });
      setIsModalOpen(false);
      fetchSlots(selectedDoctor.doctor_id); // Refresh slots after booking
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to book appointment');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-3xl font-bold mb-6">Doctors</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.length > 0 ? (
              doctors.map((doctor) => (
                <div
                  key={doctor.doctor_id}
                  className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center"
                >
                  <FaUserMd size={96} className="text-gray-500 mb-4" />
                  <h2 className="text-xl font-semibold">{doctor.name}</h2>
                  <p className="text-gray-600">{doctor.email}</p>
                  <p className="text-gray-600">{doctor.specialization || 'General Practitioner'}</p>
                  <button
                    onClick={() => handleBookClick(doctor)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                  >
                    Book Appointment
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center">No doctors available</p>
            )}
          </div>
        </main>
      </div>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Book Appointment with {selectedDoctor?.name}</h2>
            <form onSubmit={handleBookAppointment}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="slot_id">
                  Select Date
                </label>
                <select
                  id="slot_id"
                  name="slot_id"
                  value={formData.slot_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Date --</option>
                  {slots.map((slot) => (
                    <option key={slot.slot_id} value={slot.slot_id}>
                      {slot.slot_date}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="slot_time">
                  Select Available Time
                </label>
                <select
                  id="slot_time"
                  name="slot_time"
                  value={formData.slot_time}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.slot_id}
                >
                  <option value="">-- Select Time --</option>
                  {formData.slot_id &&
                    slots
                      .find((s) => s.slot_id === parseInt(formData.slot_id))
                      ?.slots.map((slot) => (
                        <option key={slot.time} value={slot.time}>
                          {slot.time}
                        </option>
                      ))}
                </select>
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
                  disabled={!formData.slot_time}
                >
                  Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDoctors;
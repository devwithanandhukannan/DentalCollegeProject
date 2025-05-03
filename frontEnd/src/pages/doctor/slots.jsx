import React, { useState, useEffect } from 'react';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import api from '../../services/admin_Services/api.js';
import { FaHome, FaFileAlt, FaCog, FaClock, FaCalendar, FaUserNurse } from 'react-icons/fa';

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ slot_date: '', selectedSlots: [] });
  const [updateSlot, setUpdateSlot] = useState({ slot_id: null, slot_date: '', selectedSlots: [] });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate 15-minute slots from 9:00 AM to 5:00 PM
  const generateDefaultSlots = () => {
    const slots = [];
    let hour = 9;
    let minute = 0;

    while (hour < 17 || (hour === 17 && minute === 0)) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      minute += 15;
      if (minute >= 60) {
        minute = 0;
        hour += 1;
      }
      const endTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(`${startTime}-${endTime}`);
    }

    return slots;
  };

  const defaultSlots = generateDefaultSlots();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/doctor/dashboard' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' }, // Placeholder
    { text: 'Reports', icon: <FaFileAlt />, to: '/doctor/reports' }, // Placeholder
    { text: 'Settings', icon: <FaCog />, to: '/doctor/settings' },
    { text: 'Slots', icon: <FaClock />, to: '/doctor/slots' },
    { text: 'Appointments', icon: <FaCalendar />, to: '/doctor/appointments' },
    { text: 'Assign Nurse', icon: <FaUserNurse />, to: '/doctor/assign-nurse' },
  ];

  // Fetch slots
  const fetchSlots = async () => {
    try {
      const response = await api.get('/doctor/slots');
      console.log('Fetched Slots:', response.data);
      setSlots(response.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to load slots');
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Handle search
  const filteredSlots = slots.filter((slot) =>
    slot.slot_date.includes(searchTerm)
  );

  // Toggle slot selection
  const toggleSlot = (slotTime, isUpdate = false) => {
    if (isUpdate) {
      const currentSlots = updateSlot.selectedSlots;
      const updatedSlots = currentSlots.includes(slotTime)
        ? currentSlots.filter((s) => s !== slotTime)
        : [...currentSlots, slotTime];
      setUpdateSlot({ ...updateSlot, selectedSlots: updatedSlots });
    } else {
      const currentSlots = newSlot.selectedSlots;
      const updatedSlots = currentSlots.includes(slotTime)
        ? currentSlots.filter((s) => s !== slotTime)
        : [...currentSlots, slotTime];
      setNewSlot({ ...newSlot, selectedSlots: updatedSlots });
    }
  };

  // Add new slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const slotData = {
        slot_date: newSlot.slot_date,
        slots: newSlot.selectedSlots, // Send only time strings
      };
      const response = await api.post('/doctor/slots', slotData);
      setSlots([...slots, response.data.slot]);
      setSuccess('Slot added successfully');
      setNewSlot({ slot_date: '', selectedSlots: [] });
      setIsAddModalOpen(false);
      await fetchSlots();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add slot');
    }
  };

  // Update slot
  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const slotData = {
        slot_date: updateSlot.slot_date,
        slots: updateSlot.selectedSlots, // Send only time strings
      };
      const response = await api.put(`/doctor/slots/${updateSlot.slot_id}`, slotData);
      setSlots(slots.map((slot) => (slot.slot_id === updateSlot.slot_id ? response.data.slot : slot)));
      setSuccess('Slot updated successfully');
      setIsUpdateModalOpen(false);
      await fetchSlots();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update slot');
    }
  };

  // Open update modal
  const openUpdateModal = (slot) => {
    setUpdateSlot({
      slot_id: slot.slot_id,
      slot_date: slot.slot_date,
      selectedSlots: slot.slots.map((s) => s.time),
    });
    setIsUpdateModalOpen(true);
  };

  // Delete slot
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    try {
      await api.delete(`/doctor/slots/${id}`);
      setSlots(slots.filter((slot) => slot.slot_id !== id));
      setSuccess('Slot deleted successfully');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to delete slot');
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
                placeholder="Search by date (YYYY-MM-DD)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            >
              New Slot
            </button>
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6">Slots</h1>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-3">ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Slots</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSlots.length > 0 ? (
                  filteredSlots.map((slot) => (
                    <tr key={slot.slot_id} className="border-t">
                      <td className="p-3">{slot.slot_id}</td>
                      <td className="p-3">{slot.slot_date}</td>
                      <td className="p-3">
                        {slot.slots.map((s) => (
                          <span
                            key={s.time}
                            className={`mr-2 ${
                              s.user_booked ? 'text-red-500' : 'text-green-500'
                            }`}
                          >
                            {s.time}
                          </span>
                        ))}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <button
                          onClick={() => openUpdateModal(slot)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(slot.slot_id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-3 text-center">
                      No slots found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Add New Slot</h2>
            <form onSubmit={handleAddSlot}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="slot_date">
                  Slot Date
                </label>
                <input
                  type="date"
                  id="slot_date"
                  value={newSlot.slot_date}
                  onChange={(e) => setNewSlot({ ...newSlot, slot_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Available Slots</label>
                <div className="grid grid-cols-4 gap-2">
                  {defaultSlots.map((slotTime) => (
                    <button
                      key={slotTime}
                      type="button"
                      onClick={() => toggleSlot(slotTime)}
                      className={`p-2 border rounded text-sm ${
                        newSlot.selectedSlots.includes(slotTime)
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      {slotTime}
                    </button>
                  ))}
                </div>
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
                  disabled={newSlot.selectedSlots.length === 0}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Slot Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-gray-500 bg-opacity-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Update Slot</h2>
            <form onSubmit={handleUpdateSlot}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="update_slot_date">
                  Slot Date
                </label>
                <input
                  type="date"
                  id="update_slot_date"
                  value={updateSlot.slot_date}
                  onChange={(e) => setUpdateSlot({ ...updateSlot, slot_date: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Available Slots</label>
                <div className="grid grid-cols-4 gap-2">
                  {defaultSlots.map((slotTime) => (
                    <button
                      key={slotTime}
                      type="button"
                      onClick={() => toggleSlot(slotTime, true)}
                      className={`p-2 border rounded text-sm ${
                        updateSlot.selectedSlots.includes(slotTime)
                          ? 'bg-green-500 text-white border-green-600'
                          : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                      }`}
                    >
                      {slotTime}
                    </button>
                  ))}
                </div>
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
                  disabled={updateSlot.selectedSlots.length === 0}
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

export default Slots;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import { FaHome, FaUsers, FaCog } from 'react-icons/fa';
import api from '../../services/admin_Services/api.js';

function CheckBiopsy() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('No file selected');
  const [model, setModel] = useState('tensorflow');
  const [reports, setReports] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/staffnurse/dashboard' },
    { text: 'Assigned Patients', icon: <FaUsers />, to: '/staffnurse/assigned-patients' },
    { text: 'Settings', icon: <FaCog />, to: '/staffnurse/settings' },
    { text: 'Check Biopsy', icon: <FaCog />, to: '/staffnurse/checkBiopsy' },
  ];

  const fetchAssignedPatients = async () => {
    try {
      const response = await api.get('/staffnurse/assigned-patients');
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error(err.response?.data?.msg || 'Failed to load assigned patients');
      if (err.response?.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/staffnurse/login');
      }
    }
  };

  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) =>
        (report.Patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  useEffect(() => {
    fetchAssignedPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('file');
    if (!fileInput.files[0]) {
      alert('Please select an image file.');
      return;
    }
    if (!selectedPatient) {
      alert('Please select a patient.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('model', model);

    try {
      const response = await axios.post('http://localhost:5002/api/predict', formData);
      setResults(response.data);
    } catch (error) {
      alert('An error occurred during processing.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const resetAnalysis = () => {
    setResults(null);
    setPreview(null);
    setFileName('No file selected');
    setNotes('');
    document.getElementById('file').value = '';
  };

  const generatePDF = () => {
    if (!selectedPatient || !results) {
      alert('Please select a patient and analyze an image first.');
      return;
    }

    const doc = new jsPDF();
    const selectedOption = document.querySelector(`#patientSelect option[value="${selectedPatient}"]`);
    const patientText = selectedOption ? selectedOption.text : 'Unknown Patient';
    const [patientName, patientId] = patientText.split(' (ID: ').map((part, index) => 
      index === 1 ? part.replace(')', '') : part
    );

    // Header
    doc.setFontSize(20);
    doc.text('MEDCARE', 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${patientName || 'N/A'}`, 20, 30);
    doc.text(`Patient ID: ${patientId || 'N/A'}`, 20, 40);

    // Uploaded Image
    if (preview) {
      doc.text('Uploaded Image:', 20, 50);
      doc.addImage(preview, 'PNG', 20, 60, 80, 80);
    }

    // Ground Truth (Overlay) and Masked Image
    if (results) {
      doc.text('Ground Truth (Overlay):', 110, 50);
      doc.addImage(`data:image/png;base64,${results.overlay_image}`, 'PNG', 110, 60, 80, 80);
      doc.text('Masked Image:', 20, 150);
      doc.addImage(`data:image/png;base64,${results.prediction_image}`, 'PNG', 20, 160, 80, 80);
    }

    // Notes
    if (notes) {
      doc.text('Notes:', 20, 250);
      doc.setFontSize(10);
      doc.text(notes, 20, 260, { maxWidth: 170 });
    }

    doc.autoPrint();
    doc.output('dataurlnewwindow');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header companyName="MEDCARE" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          <section className="bg-white p-6 rounded-lg shadow-md">
            {/* Patient Selection */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Patient</h2>
              <input
                type="text"
                placeholder="Search patients..."
                className="w-full p-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                id="patientSelect"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a patient</option>
                {filteredReports.map((report) => (
                  <option key={report.report_id} value={report.report_id}>
                    {report.Patient?.name || 'N/A'} (ID: {report.Patient?.patient_number || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Notes Area */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Add notes here..."
              />
            </div>

            {/* Balance Section (Placeholder) */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Balance</h3>
              <p className="text-gray-600">Balance information can be added here.</p>
            </div>

            {/* Image Analysis Section */}
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Image Analysis</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="file" className="block text-gray-700 font-medium mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">{fileName}</span>
              </div>

              {preview && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Preview</h3>
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 max-w-full h-auto rounded-md border"
                  />
                </div>
              )}

              <div>
                <label htmlFor="model" className="block text-gray-700 font-medium mb-1">
                  Model
                </label>
                <select
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tensorflow">TensorFlow (U-Net)</option>
                  <option value="pytorch">PyTorch (SwinUNet++)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </form>

            {results && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-md shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Masked Image</h3>
                    <img
                      src={`data:image/png;base64,${results.prediction_image}`}
                      alt="Masked"
                      className="mt-2 max-w-full h-auto rounded-md border"
                    />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-md shadow">
                    <h3 className="text-lg font-semibold text-gray-700">Ground Truth</h3>
                    <img
                      src={`data:image/png;base64,${results.overlay_image}`}
                      alt="Overlay"
                      className="mt-2 max-w-full h-auto rounded-md border"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
                    onClick={generatePDF}
                  >
                    Generate PDF
                  </button>
                  <button
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                    onClick={resetAnalysis}
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default CheckBiopsy;
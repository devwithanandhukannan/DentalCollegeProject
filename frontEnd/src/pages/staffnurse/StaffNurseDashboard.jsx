import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { FaHome, FaUsers, FaCog } from 'react-icons/fa';
import api from '../../services/admin_Services/api.js';
import Header from '../../components/Header.jsx';
import Sidebar from '../../components/Sidebar.jsx';
import { useNavigate } from 'react-router-dom';


ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const StaffNurseDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sidebarOptions = [
    { text: 'Dashboard', icon: <FaHome />, to: '/staffnurse/dashboard' },
    { text: 'Assigned Patients', icon: <FaUsers />, to: '/staffnurse/assigned-patients' },
    { text: 'Settings', icon: <FaCog />, to: '/staffnurse/settings' },
    { text: 'checkBio', icon: <FaCog />, to: '/staffnurse/checkBiopsy' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/staffnurse/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('staffToken')}` },
        });
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        if (err.response?.status === 401) {
          localStorage.removeItem('staffToken');
          navigate('/staffnurse/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  const { nurse, totalReports, totalPatients, statusCounts, statusGraphData, patientGraphData } = dashboardData;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1">
        <Sidebar options={sidebarOptions} />
        <main className="flex-1 p-6">
          <div className="bg-white p-4 rounded shadow mb-6">
            <h2 className="text-xl font-semibold">Welcome, {nurse.name}</h2>
            <p className="text-gray-600">Email: {nurse.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Total Patients</h3>
              <p className="text-2xl">{totalPatients}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Total Reports</h3>
              <p className="text-2xl">{totalReports}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold">Pending Reports</h3>
              <p className="text-2xl">{statusCounts['Pending'] || 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Report Status Distribution</h3>
              <div className="h-40 w-40 mx-auto">
                <Pie data={statusGraphData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Reports per Patient</h3>
              <div className="h-40 w-full">
                <Bar data={patientGraphData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffNurseDashboard;

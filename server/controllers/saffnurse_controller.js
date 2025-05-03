import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Doctor, Patient, Report, StaffNurse } from '../models/models.js';
import { STAFF_JWT_SECRET } from '../middleware/staffnurse_auth.js'; // Correct import
import dotenv from 'dotenv';
import { log } from 'console';

dotenv.config();

// ------------------------------------------------------------------------------------------------------------------------------------------------
//                                       STAFF MANAGEMENT
// ------------------------------------------------------------------------------------------------------------------------------------------------

/////////////////////////////////////////// Staff Nurse Login ///////////////////////////////////////////
export const staffLogin = async (req, res) => {
  
  const { email, password } = req.body;

  try {
    const staffNurse = await StaffNurse.findOne({ where: { email } });
    if (!staffNurse) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, staffNurse.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }    
    const token = jwt.sign({ nurse_id: staffNurse.nurse_id }, STAFF_JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error logging in staff nurse:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

////////////////////////////////////////// Staff Nurse Logout //////////////////////////////////////////
export const staffLogout = async (req, res) => {
  console.log('staff logout');
  
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    staffBlacklistedTokens.add(token);
  }
  res.json({ msg: 'Logged out successfully' });
};

//////////////////////////////////////// Update Staff Nurse Profile /////////////////////////////////////
export const updateStaffProfile = async (req, res) => {
  const { name, email, password } = req.body;
  const nurse_id = req.staff.nurse_id;

  try {
    const staffNurse = await StaffNurse.findByPk(nurse_id);
    if (!staffNurse) {
      return res.status(404).json({ msg: 'Staff nurse not found' });
    }

    if (name) staffNurse.name = name;
    if (email) staffNurse.email = email;
    if (password) staffNurse.password = await bcrypt.hash(password, 10);

    await staffNurse.save();
    res.json({ msg: 'Profile updated successfully', staffNurse });
  } catch (error) {
    console.error('Error updating staff profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////// Get Assigned Patients /////////////////////////////////////
export const getAssignedPatients = async (req, res) => {
  const nurse_id = req.staff.nurse_id;

  try {
    const reports = await Report.findAll({
      where: { nurse_id },
      include: [
        { model: Patient, attributes: ['patient_id', 'name', 'patient_number'] },
      ],
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching assigned patients:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////// Send Report /////////////////////////////////////


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer'; // Add this import

const __filename = fileURLToPath(import.meta.url);
console.log(__filename);

const __dirname = path.dirname(__filename);
console.log(__dirname);

const uploadDir = path.join(__dirname, '../uploads');

export const sendReport = async (req, res) => {
  const { report_id, content } = req.body;
  const nurse_id = req.staff.nurse_id;
  console.log(req.body);
  
  try {
    console.log('📥 Received report_id:', report_id);
    console.log('📥 Received content:', content);
    console.log('📄 Uploaded file:', req.file);

    let file_path = null;
    if (req.file) {
      file_path = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('📤 File path:', file_path);
    }

    const report = await Report.findOne({ where: { report_id, nurse_id } });
    if (!report) {
      return res.status(404).json({ msg: 'Report not found or not assigned to you' });
    }

    report.content = content || report.content;
    report.file_path = file_path || report.file_path;
    report.status = 'Submitted';
    await report.save();

    res.json({
      msg: 'Report sent to doctor successfully',
      report,
    });
  } catch (error) {
    console.error('❌ Error in sendReport:', error);
    res.status(500).json({ msg: 'Failed to send report', error: error.message });
  }
};


////////////////////////////////// Dashboard Graph ////////////////////////////////////////////

export const getDashboardData = async (req, res) => {
  const nurse_id = req.staff.nurse_id;

  try {
    // Fetch nurse profile
    const nurse = await StaffNurse.findByPk(nurse_id, {
      attributes: ['name', 'email'],
    });
    if (!nurse) {
      return res.status(404).json({ msg: 'Staff nurse not found' });
    }

    // Fetch assigned reports with patient details
    const reports = await Report.findAll({
      where: { nurse_id },
      include: [
        { model: Patient, attributes: ['patient_id', 'name', 'patient_number'] },
      ],
    });

    // Calculate statistics
    const totalReports = reports.length;
    const totalPatients = new Set(reports.map((r) => r.patient_id)).size;
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {});

    // Prepare data for pie chart (report status distribution)
    const statusGraphData = {
      labels: Object.keys(statusCounts),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        },
      ],
    };

    // Prepare data for bar chart (reports per patient)
    const patientReportCounts = reports.reduce((acc, report) => {
      const patientName = report.Patient.name;
      acc[patientName] = (acc[patientName] || 0) + 1;
      return acc;
    }, {});
    const patientGraphData = {
      labels: Object.keys(patientReportCounts),
      datasets: [
        {
          label: 'Reports per Patient',
          data: Object.values(patientReportCounts),
          backgroundColor: '#36A2EB',
        },
      ],
    };

    // Prepare response
    const dashboardData = {
      nurse: { name: nurse.name, email: nurse.email },
      totalReports,
      totalPatients,
      statusCounts,
      statusGraphData,
      patientGraphData,
      recentReports: reports.slice(0, 5).map((r) => ({
        report_id: r.report_id,
        patientName: r.Patient.name,
        patientNumber: r.Patient.patient_number,
        status: r.status,
        content: r.content,
      })),
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


/////////////////////////////////// get profile ///////////////////////////
export const getStaffProfile = async (req, res) => {
  console.log('hii');
  
  const nurse_id = req.staff.nurse_id; // Extracted from JWT via middleware

  try {
    const staffNurse = await StaffNurse.findByPk(nurse_id, {
      attributes: ['name', 'email'], // Only return necessary fields, exclude sensitive data like password
    });

    if (!staffNurse) {
      return res.status(404).json({ msg: 'Staff nurse not found' });
    }

    res.status(200).json(staffNurse);
  } catch (error) {
    console.error('Error fetching staff profile:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Appointment, Doctor, Patient, Report, Slot, Specialization, StaffNurse } from '../models/models.js';
import { DOCTOR_JWT_SECRET } from '../middleware/doctor_auth.js';
import dotenv from 'dotenv';

dotenv.config();

// ------------------------------------------------------------------------------------------------------------------------------------------------
// DOCTOR
// ------------------------------------------------------------------------------------------------------------------------------------------------



////////////////////////////////////////////////// Doctor Login //////////////////////////////////////////////////
export const doctorLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ where: { email } });

    if (!doctor) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ doctor_id: doctor.doctor_id }, DOCTOR_JWT_SECRET, { expiresIn: '1h' });

    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error('Error during doctor login:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

///////////////////////////////////////////////// Doctor Logout /////////////////////////////////////////////////
export const doctorLogout = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  doctorBlacklistedTokens.add(token);
  res.json({ msg: 'Logged out successfully' });
};

//////////////////////////////////////////////// Update Doctor Profile //////////////////////////////////////////
export const updateDoctorProfile = async (req, res) => {
  const { name, email, oldPassword, newPassword } = req.body;
  const doctor_id = req.doctor.doctor_id; // From protectDoctor middleware

  try {
    const doctor = await Doctor.findByPk(doctor_id);

    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Check if new email conflicts with another doctor
    if (email && email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ where: { email } });
      if (existingDoctor) {
        return res.status(400).json({ msg: 'Email already in use by another doctor' });
      }
    }

    let updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, doctor.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Old password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateFields.password = hashedPassword;
    }

    if (Object.keys(updateFields).length > 0) {
      await doctor.update(updateFields);
    }

    res.json({ msg: 'Profile updated successfully', doctor });
  } catch (err) {
    console.error('Error updating doctor profile:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getDoctorDetails = async (req, res) => {
  const doctor_id = req.doctor.doctor_id; // From protectDoctor middleware

  try {
    const doctor = await Doctor.findByPk(doctor_id, {
      attributes: ['doctor_id', 'name', 'email', 'specialization_id'],
    });

    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (err) {
    console.error('Error in getDoctorDetails:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};


// ------------------------------------------------------------------------------------------------------------------------------------------------
//                                       Slot CRUD Operations (Doctor-controlled)
// ------------------------------------------------------------------------------------------------------------------------------------------------

//////////////////////////////////////////////// Create Slot /////////////////////////////////////////////////
export const createSlot = async (req, res) => {
  const { slot_date, slots } = req.body;
  const doctor_id = req.doctor.doctor_id;
  console.log(req.body);
  

  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot_date)) {
      return res.status(400).json({ msg: 'Invalid slot_date format, use YYYY-MM-DD' });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ msg: 'Slots must be a non-empty array of time strings' });
    }

    const slotData = slots.map((time) => {
      if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(time)) {
        throw new Error(`Invalid time format: ${time}. Use "HH:MM-HH:MM"`);
      }
      return {
        time,
        doctor_selected: true,
        user_booked: false,
        patient_id: null,
      };
    });

    const slot = await Slot.create({
      doctor_id,
      slot_date,
      slots: slotData,
    });

    res.status(201).json({ msg: 'Slot created successfully', slot });
  } catch (error) {
    console.error('Error creating slot:', error.message);
    res.status(400).json({ msg: error.message || 'Server error' });
  }
};

/////////////////////////////////////////////// Get All Slots /////////////////////////////////////////////////
export const getAllSlots = async (req, res) => {
  const doctor_id = req.doctor.doctor_id;
  try {
    const slots = await Slot.findAll({ where: { doctor_id } });
    res.json(slots);
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Update Slot /////////////////////////////////////////////////
export const updateSlot = async (req, res) => {
  const { slot_id } = req.params;
  const { slot_date, slots } = req.body;
  const doctor_id = req.doctor.doctor_id;

  try {
    const slot = await Slot.findOne({ where: { slot_id, doctor_id } });
    if (!slot) {
      return res.status(404).json({ msg: 'Slot not found' });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(slot_date)) {
      return res.status(400).json({ msg: 'Invalid slot_date format, use YYYY-MM-DD' });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ msg: 'Slots must be a non-empty array of time strings' });
    }

    const slotData = slots.map((time) => {
      if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(time)) {
        throw new Error(`Invalid time format: ${time}. Use "HH:MM-HH:MM"`);
      }
      return {
        time,
        doctor_selected: true,
        user_booked: false,
        patient_id: null,
      };
    });

    await slot.update({ slot_date, slots: slotData });
    res.json({ msg: 'Slot updated successfully', slot });
  } catch (error) {
    console.error('Error updating slot:', error.message);
    res.status(400).json({ msg: error.message || 'Server error' });
  }
};

/////////////////////////////////////////////// Delete Slot /////////////////////////////////////////////////
export const deleteSlot = async (req, res) => {
  const { slot_id } = req.params;
  const doctor_id = req.doctor.doctor_id;

  try {
    const slot = await Slot.findOne({ where: { slot_id, doctor_id } });
    if (!slot) {
      return res.status(404).json({ msg: 'Slot not found' });
    }

    await slot.destroy();
    res.json({ msg: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Create Slot /////////////////////////////////////////////////


// ------------------------------------------------------------------------------------------------------------------------------------------------
//                                                  PATIENTS
// ------------------------------------------------------------------------------------------------------------------------------------------------

//////////////////////////////////////////////// Get All Patients Who Booked Doctor //////////////////////////////////
export const getDoctorPatients = async (req, res) => {
  const doctor_id = req.doctor.doctor_id;

  try {
    const appointments = await Appointment.findAll({
      where: { doctor_id },
      attributes: ['patient_id'], // Only need patient_id to get unique patients
      include: [
        {
          model: Patient,
          attributes: ['patient_id', 'name', 'email', 'patient_number', 'phone'],
        },
      ],
      group: ['patient_id', 'Patient.patient_id'], // Ensure unique patients
    });

    const patients = appointments.map((appt) => appt.Patient);

    if (patients.length === 0) {
      return res.json({ msg: 'No patients have booked appointments with you', patients: [] });
    }

    res.json({ msg: 'Patients retrieved successfully', patients });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ------------------------------------------------------------------------------------------------------------------------------------------------
// APPOINTMENTS
// ------------------------------------------------------------------------------------------------------------------------------------------------


//////////////////////////////////////////////// Get All Doctor's Appointments //////////////////////////////////
export const getDoctorAppointments = async (req, res) => {
  const doctor_id = req.doctor.doctor_id;

  try {
    const appointments = await Appointment.findAll({
      where: { doctor_id },
      include: [
        { model: Patient, attributes: ['name', 'email', 'patient_number', 'phone'] },
        { model: Slot, attributes: ['slot_date'] }
      ]
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////////////// Update Appointment Status ///////////////////////////////
export const updateAppointmentStatus = async (req, res) => {
  const { appointment_id } = req.params;
  const { status } = req.body;
  const doctor_id = req.doctor.doctor_id;

  try {
    // Validate status
    const validStatuses = ['Scheduled', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: 'Invalid status. Must be Scheduled, Completed, or Cancelled' });
    }

    // Find appointment and ensure it belongs to the doctor
    const appointment = await Appointment.findOne({
      where: { appointment_id, doctor_id }
    });
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found or not owned by you' });
    }

    // Check if status is already the same
    if (appointment.status === status) {
      return res.status(400).json({ msg: `Appointment is already ${status}` });
    }

    // Update status
    await appointment.update({ status });

    // If cancelled by doctor, update the slot
    if (status === 'Cancelled') {
      const slot = await Slot.findByPk(appointment.slot_id);
      if (slot) {
        let slotsArray = slot.slots || [];
        const slotIndex = slotsArray.findIndex(s => s.time === appointment.slot_time);
        if (slotIndex !== -1) {
          const updatedSlots = [...slotsArray];
          updatedSlots[slotIndex] = {
            ...updatedSlots[slotIndex],
            user_booked: false,
            patient_id: null
          };
          slot.slots = updatedSlots;
          await slot.save();
        }
      }
    }

    res.json({ msg: 'Appointment status updated successfully', appointment });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


// ------------------------------------------------------------------------------------------------------------------------------------------------
// REPORTS
// ------------------------------------------------------------------------------------------------------------------------------------------------



////////////////////////////////////////// Submit Report to Allocate Patient to Staff Nurse //////////////////////////////
export const submitReportForNurseAllocation = async (req, res) => {
  console.log('Raw Request Headers:', req.headers);
  console.log('Request Body:', req.body);
  console.log('Request File:', req.file);

  const { patient_id, nurse_id, content } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  const doctor_id = req.doctor.doctor_id;

  try {
    if (!patient_id || !nurse_id) {
      return res.status(400).json({ msg: 'patient_id and nurse_id are required' });
    }

    const patient = await Patient.findByPk(patient_id);
    if (!patient) {
      return res.status(400).json({ msg: 'Invalid patient_id' });
    }

    const staffNurse = await StaffNurse.findByPk(nurse_id);
    if (!staffNurse) {
      return res.status(400).json({ msg: 'Invalid nurse_id' });
    }

    const appointment = await Appointment.findOne({
      where: { patient_id, doctor_id, status: 'Scheduled' },
    });
    if (!appointment) {
      return res.status(400).json({ msg: 'No active appointment found for this patient with you' });
    }

    const report = await Report.create({
      patient_id,
      doctor_id,
      nurse_id,
      status: 'Pending',
      content: content || null,
      file_path: file_path || null,
      submission_date: new Date(),
    });

    res.status(201).json({ msg: 'Report submitted successfully for nurse allocation', report });
  } catch (error) {
    console.error('Error submitting report for nurse allocation:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const getAllocatedNurseReports = async (req, res) => {
  const doctor_id = req.doctor.doctor_id;

  try {
    const reports = await Report.findAll({
      where: { doctor_id },
      include: [
        { model: Patient, attributes: ['name', 'patient_number'] },
        { model: StaffNurse, attributes: ['name', 'email'], as: 'StaffNurse' },
      ],
    });

    if (reports.length === 0) {
      return res.json({ msg: 'No nurse allocations found', reports: [] });
    }

    res.json({ msg: 'Allocated nurse reports retrieved successfully', reports });
  } catch (error) {
    console.error('Error fetching allocated nurse reports:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

////////////////////////////////////////// New: Update Nurse Allocation Report /////////////////////////
export const updateNurseAllocationReport = async (req, res) => {
  const { report_id } = req.params;
  const { patient_id, nurse_id, content, status } = req.body;
  const file_path = req.file ? req.file.path : null;
  const doctor_id = req.doctor.doctor_id;

  try {
    const report = await Report.findOne({ where: { report_id, doctor_id } });
    if (!report) return res.status(404).json({ msg: 'Report not found or not owned by you' });

    const updateFields = {};
    if (patient_id && patient_id !== report.patient_id) {
      const patient = await Patient.findByPk(patient_id);
      if (!patient) return res.status(400).json({ msg: 'Invalid patient_id' });
      updateFields.patient_id = patient_id;
    }
    if (nurse_id && nurse_id !== report.nurse_id) {
      const staffNurse = await StaffNurse.findByPk(nurse_id);
      if (!staffNurse) return res.status(400).json({ msg: 'Invalid nurse_id' });
      updateFields.nurse_id = nurse_id;
    }
    if (content) updateFields.content = content;
    if (status) updateFields.status = status;
    if (file_path) updateFields.file_path = file_path;

    if (Object.keys(updateFields).length > 0) {
      await report.update(updateFields);
    }

    res.json({ msg: 'Nurse allocation report updated successfully', report });
  } catch (error) {
    console.error('Error updating nurse allocation report:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

///////////////////////////////////// New: Delete Nurse Allocation Report /////////////////////////////////////
export const deleteNurseAllocationReport = async (req, res) => {
  const { report_id } = req.params;
  const doctor_id = req.doctor.doctor_id;

  try {
    const report = await Report.findOne({ where: { report_id, doctor_id } });
    if (!report) return res.status(404).json({ msg: 'Report not found or not owned by you' });

    await report.destroy();
    res.json({ msg: 'Nurse allocation report deleted successfully' });
  } catch (error) {
    console.error('Error deleting nurse allocation report:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// ------------------------------------------------------------------------------------------------------------------------------------------------
// STAFF NURSES
// ------------------------------------------------------------------------------------------------------------------------------------------------


//////////////////////////////////////////////// Get Assigned Staff Nurses //////////////////////////////////
export const getAssignedStaffNurses = async (req, res) => {
  const doctor_id = req.doctor.doctor_id;

  try {
    const staffNurses = await StaffNurse.findAll({
      where: { assigned_doctor_id: doctor_id },
      attributes: ['nurse_id', 'name', 'email']
    });

    if (staffNurses.length === 0) {
      return res.json({ msg: 'No staff nurses assigned to you', staffNurses: [] });
    }

    res.json({ msg: 'Assigned staff nurses retrieved successfully', staffNurses });
  } catch (error) {
    console.error('Error fetching assigned staff nurses:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const getDoctorReports = async (req, res) => {
  const doctor_id = req.doctor.doctor_id;

  try {
    const reports = await Report.findAll({
      where: { doctor_id },
      include: [
        { model: Patient, attributes: ['patient_id', 'name', 'patient_number'] },
        { model: StaffNurse, attributes: ['nurse_id', 'name', 'email'] },
      ],
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching doctor reports:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////// Update Report Status ///////////////////////////////////////////
export const updateReportStatus = async (req, res) => {
  const { report_id, status } = req.body;
  const doctor_id = req.doctor.doctor_id;
  console.log(status);
  
  try {
    const report = await Report.findOne({ where: { report_id, doctor_id } });
    if (!report) {
      return res.status(404).json({ 
        msg: `Report with ID ${report_id} not found or not assigned to doctor ID ${doctor_id}` 
      });
    }

    // Validate status against ENUM values
    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'Resubmitted',];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    report.status = status;
    await report.save();

    res.json({ msg: 'Report status updated successfully', report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
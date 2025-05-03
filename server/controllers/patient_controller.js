import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Appointment, Doctor, Patient, Slot } from '../models/models.js';
import { PATIENT_JWT_SECRET } from '../middleware/patient_auth.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// ------------------------------------------------------------------------------------------------------------------------------------------------
//                                       patient CRUD Operations (Doctor-controlled)
// ------------------------------------------------------------------------------------------------------------------------------------------------

//////////////////////////////////////////////// patientRegister /////////////////////////////////////////////////
export const patientRegister = async (req, res) => {
    const { name, email, password, phone, address } = req.body; // Remove patient_number from input
  
    try {
      // Check if patient already exists by email
      const existingPatient = await Patient.findOne({ where: { email } });
      if (existingPatient) {
        return res.status(400).json({ msg: 'Email already exists' });
      }
  
      // Generate a unique patient number (you can customize this format)
      const patient_number = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      const patient = await Patient.create({
        name,
        email,
        password: hashedPassword,
        patient_number, 
        phone,
        address
      });
  
      const token = jwt.sign({ patient_id: patient.patient_id }, PATIENT_JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({ msg: 'Patient registered successfully', token, patient_number });
    } catch (error) {
      console.error('Error registering patient:', error);
      res.status(500).json({ msg: 'Server error' });
    }
  };

//////////////////////////////////////////// Patient Login //////////////////////////////////////////////////
export const patientLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const patient = await Patient.findOne({ where: { email } });

    if (!patient) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ patient_id: patient.patient_id }, PATIENT_JWT_SECRET, { expiresIn: '1h' });

    res.json({ msg: 'Login successful', token });
  } catch (err) {
    console.error('Error during patient login:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Patient Logout ////////////////////////////////////////////////
export const patientLogout = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  patientBlacklistedTokens.add(token);
  res.json({ msg: 'Logged out successfully' });
};

////////////////////////////////////////////// Get Patient Details ////////////////////////////////////////////
export const getPatientDetails = async (req, res) => {

  const patient_id = req.patient.patient_id; // From protectPatient middleware


  try {
    const patient = await Patient.findByPk(patient_id, {
      attributes: ['patient_id', 'name', 'email', 'phone', 'patient_number', 'address'],
    });

    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    // Optional: Include additional details like appointment count
    const appointmentCount = await Appointment.count({ where: { patient_id } });

    res.json({
      patient: {
        patient_id: patient.patient_id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        patient_number: patient.patient_number,
        address: patient.address,
        appointment_count: appointmentCount, // Optional enhancement
      },
    });
  } catch (err) {
    console.error('Error fetching patient details:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

////////////////////////////////////////////// Update Patient Profile //////////////////////////////////////////
export const updatePatientProfile = async (req, res) => {
  const { name, email, oldPassword, newPassword, patient_number, phone, address } = req.body;
  const patient_id = req.patient.patient_id; // From protectPatient

  try {
    const patient = await Patient.findByPk(patient_id);

    if (!patient) {
      return res.status(404).json({ msg: 'Patient not found' });
    }

    // Check if new email or patient_number conflicts
    if (email && email !== patient.email) {
      const emailExists = await Patient.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }
    if (patient_number && patient_number !== patient.patient_number) {
      const numberExists = await Patient.findOne({ where: { patient_number } });
      if (numberExists) {
        return res.status(400).json({ msg: 'Patient number already in use' });
      }
    }

    let updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (patient_number) updateFields.patient_number = patient_number;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, patient.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Old password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateFields.password = hashedPassword;
    }

    if (Object.keys(updateFields).length > 0) {
      await patient.update(updateFields);
    }

    res.json({ msg: 'Profile updated successfully', patient });
  } catch (err) {
    console.error('Error updating patient profile:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};



// ------------------------------------------------------------------------------------------------------------------------------------------------
//                                                 Book an Appointment
// ------------------------------------------------------------------------------------------------------------------------------------------------

/////////////////////////////////////////////// Get All Doctors ////////////////////////////////////////////////
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      attributes: ['doctor_id', 'name', 'email', 'specialization_id'],
    });
    res.json({ doctors });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Get Doctor Slots ////////////////////////////////////////////////
export const getDoctorSlots = async (req, res) => {
  const { doctor_id } = req.query;

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(400).json({ msg: 'Invalid doctor_id' });
    }

    const slots = await Slot.findAll({
      where: { doctor_id },
      attributes: ['slot_id', 'slot_date', 'slots'],
    });

    // Filter to show only available slots
    const availableSlots = slots.map((slot) => ({
      slot_id: slot.slot_id,
      slot_date: slot.slot_date,
      slots: slot.slots.filter((s) => s.doctor_selected && !s.user_booked),
    })).filter((slot) => slot.slots.length > 0); // Only include slots with available times

    res.json(availableSlots);
  } catch (error) {
    console.error('Error fetching doctor slots:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Book Appointment ////////////////////////////////////////////////
export const bookAppointment = async (req, res) => {
  const { doctor_id, slot_id, slot_time } = req.body;
  const patient_id = req.patient.patient_id;

  try {
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(400).json({ msg: 'Invalid doctor_id' });
    }

    const slot = await Slot.findOne({ where: { slot_id, doctor_id } });
    if (!slot) {
      return res.status(400).json({ msg: 'Invalid slot_id or slot does not belong to this doctor' });
    }

    let slotsArray = slot.slots || [];
    const slotIndex = slotsArray.findIndex((s) => s.time === slot_time);
    if (slotIndex === -1) {
      return res.status(400).json({ msg: 'Slot time not found' });
    }
    if (slotsArray[slotIndex].user_booked) {
      return res.status(400).json({ msg: 'Slot is already booked' });
    }
    if (!slotsArray[slotIndex].doctor_selected) {
      return res.status(400).json({ msg: 'Slot is not available for booking (doctor not selected)' });
    }

    const updatedSlots = [...slotsArray];
    updatedSlots[slotIndex] = {
      ...updatedSlots[slotIndex],
      user_booked: true,
      patient_id: patient_id,
    };

    slot.slots = updatedSlots;
    await slot.save();

    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      slot_id,
      slot_time,
      status: 'Scheduled',
    });

    res.status(201).json({ msg: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Get Patient Appointments ////////////////////////////////////////////////
export const getPatientAppointments = async (req, res) => {
  const patient_id = req.patient.patient_id;

  try {
    const appointments = await Appointment.findAll({
      where: { patient_id },
      include: [
        { model: Doctor, attributes: ['name', 'email'] },
        { model: Slot, attributes: ['slot_date'] },
      ],
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

/////////////////////////////////////////////// Cancel Appointment ////////////////////////////////////////////////
export const cancelAppointment = async (req, res) => {
  const { appointment_id } = req.params;
  const patient_id = req.patient.patient_id;

  try {
    const appointment = await Appointment.findOne({
      where: { appointment_id, patient_id },
    });
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found or not owned by you' });
    }

    if (appointment.status === 'Cancelled') {
      return res.status(400).json({ msg: 'Appointment is already cancelled' });
    }

    await appointment.update({ status: 'Cancelled' });

    const slot = await Slot.findByPk(appointment.slot_id);
    if (slot) {
      let slotsArray = slot.slots || [];
      const slotIndex = slotsArray.findIndex((s) => s.time === appointment.slot_time);
      if (slotIndex !== -1) {
        const updatedSlots = [...slotsArray];
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          user_booked: false,
          patient_id: null,
        };
        slot.slots = updatedSlots;
        await slot.save();
      }
    }

    res.json({ msg: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
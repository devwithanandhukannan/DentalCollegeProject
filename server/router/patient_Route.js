import express from 'express';
import {
  patientRegister,
  patientLogin,
  patientLogout,
  updatePatientProfile,
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  getPatientDetails,
  getAllDoctors,
  getDoctorSlots
} from '../controllers/patient_controller.js';
import { protectPatient } from '../middleware/patient_auth.js';

const router = express.Router();

////////////////////////////////// Patient Routes ///////////////////////////////////////////////
router.post('/register', patientRegister);              // Register (public)
router.post('/login', patientLogin);                    // Login (public)
router.post('/logout', protectPatient, patientLogout);  // Logout (protected)
router.put('/update-profile', protectPatient, updatePatientProfile); // Update profile (protected)
//////////////////////////////// Patient Appointments ///////////////////////////////////////////
router.post('/appointments', protectPatient, bookAppointment);
router.get('/appointments', protectPatient, getPatientAppointments);
router.put('/appointments/:appointment_id/cancel', protectPatient, cancelAppointment);
router.get('/details', protectPatient, getPatientDetails);
router.get('/doctors', getAllDoctors);
router.get('/doctor/slots', protectPatient, getDoctorSlots); // Protected for patients
export default router;
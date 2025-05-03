import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    doctorLogin,
    doctorLogout,
    updateDoctorProfile,
    createSlot,
    getAllSlots,
    updateSlot,
    deleteSlot,
    getDoctorAppointments,
    updateAppointmentStatus,
    submitReportForNurseAllocation,
    getAssignedStaffNurses,
    getDoctorDetails,
    getDoctorPatients,
    getAllocatedNurseReports,
    updateNurseAllocationReport,
    deleteNurseAllocationReport,
    getDoctorReports,
    updateReportStatus
} from '../controllers/doctor_controller.js';
import { protectDoctor } from '../middleware/doctor_auth.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const router = express.Router();

////////////////////////////////////////////// Doctor Routes //////////////////////////////////////////////
router.post('/login', doctorLogin);                  // Doctor login (public)
router.post('/logout', protectDoctor, doctorLogout); // Doctor logout (protected)
router.put('/update-profile', protectDoctor, updateDoctorProfile); // Update profile (protected)
router.get('/details', protectDoctor, getDoctorDetails);
/////////////////////////////////////////// Slot Routes //////////////////////////////////////////////////
router.post('/slots', protectDoctor, createSlot);
router.get('/slots', protectDoctor, getAllSlots);
router.put('/slots/:slot_id', protectDoctor, updateSlot);
router.delete('/slots/:slot_id', protectDoctor, deleteSlot);
////////////////////////////// Appointment Routes ////////////////////////////////////////////////
router.get('/appointments', protectDoctor, getDoctorAppointments);                          // View all appointments
router.put('/appointments/:appointment_id/status', protectDoctor, updateAppointmentStatus); // Update status
////////////////////////////////////////////// Report Routes //////////////////////////////////////////////
router.post('/reports/allocate-nurse', protectDoctor, submitReportForNurseAllocation);
///////////////////////////////////////////// Staff Nurse Routes ///////////////////////////////////////////
router.get('/assigned-nurses', protectDoctor, getAssignedStaffNurses); // New
router.get('/patients', protectDoctor, getDoctorPatients);
router.get('/reports', protectDoctor, getAllocatedNurseReports); // New
router.put('/reports/:report_id', protectDoctor, upload.single('file_path'), updateNurseAllocationReport); // New
router.delete('/reports/:report_id', protectDoctor, deleteNurseAllocationReport); // New
router.get('/reports', protectDoctor, getDoctorReports);          // Get all reports for this doctor
router.post('/reports/status', protectDoctor, updateReportStatus );
export default router;
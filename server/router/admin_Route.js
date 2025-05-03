import express from "express";
import { adminLogin, 
    adminLogout, 
    updateProfile, 
    createAdmin, 
    getAdminDetails ,
    createSpecialization,
    getAllSpecializations,
    getSpecializationById,
    updateSpecialization,
    deleteSpecialization,
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor,
    createStaffNurse,
    getAllStaffNurses,
    getStaffNurseById,
    updateStaffNurse,
    deleteStaffNurse,
} from "../controllers/admin_controller.js";
import { protectAdmin } from "../middleware/admin_auth.js";

const router = express.Router();

router.post('/register', createAdmin);
router.post('/login', adminLogin);
router.post('/logout', protectAdmin, adminLogout);
router.put('/update-profile', protectAdmin, updateProfile);
router.get('/details', protectAdmin, getAdminDetails);
////////////////////////////// specializations //////////////////////////////
router.post('/specializations', protectAdmin, createSpecialization);        // Create
router.get('/specializations', protectAdmin, getAllSpecializations);       // Read all
router.get('/specializations/:id', protectAdmin, getSpecializationById);   // Read one
router.put('/specializations/:id', protectAdmin, updateSpecialization);    // Update
router.delete('/specializations/:id', protectAdmin, deleteSpecialization);  // Delete
////////////////////////////// doctors //////////////////////////////
router.post('/doctors', protectAdmin, createDoctor);        // Create
router.get('/doctors', protectAdmin, getAllDoctors);        // Read all
router.get('/doctors/:id', protectAdmin, getDoctorById);    // Read one
router.put('/doctors/:id', protectAdmin, updateDoctor);     // Update
router.delete('/doctors/:id', protectAdmin, deleteDoctor);   // Delete
////////////////////////////// staff-nurses //////////////////////////////
router.post('/staff-nurses', protectAdmin, createStaffNurse);        // Create
router.get('/staff-nurses', protectAdmin, getAllStaffNurses);        // Read all
router.get('/staff-nurses/:id', protectAdmin, getStaffNurseById);    // Read one
router.put('/staff-nurses/:id', protectAdmin, updateStaffNurse);     // Update
router.delete('/staff-nurses/:id', protectAdmin, deleteStaffNurse);   // Delete


export default router;
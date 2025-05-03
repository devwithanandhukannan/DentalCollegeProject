import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  staffLogin,
  staffLogout,
  updateStaffProfile,
  getAssignedPatients,
  sendReport,
  getDashboardData,
  getStaffProfile
} from '../controllers/saffnurse_controller.js';
import { protectStaff } from '../middleware/staffnurse_auth.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Set up multer for file uploads
const uploadDir = path.join(__dirname, '../uploads'); // Absolute path from router folder
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // Create if not exists
  console.log('📁 Created uploads folder in:', uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📂 Saving file to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log('📄 Generated filename:', filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    console.log('📋 File type:', file.mimetype);
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.error('❌ Invalid file type:', file.mimetype);
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed'));
    }
  }
});

// Staff Nurse Routes
router.post('/login', staffLogin);
router.post('/logout', protectStaff, staffLogout);
router.put('/update-profile', protectStaff, updateStaffProfile);
router.get('/profile', protectStaff, getStaffProfile);
router.get('/assigned-patients', protectStaff, getAssignedPatients);
router.get('/dashboard', protectStaff, getDashboardData);
router.post('/send-report', protectStaff, upload.single('file'), (req, res, next) => {
  console.log('📤 File upload middleware executed');
  console.log('📄 Uploaded file:', req.file);
  next();
}, sendReport);

export default router;
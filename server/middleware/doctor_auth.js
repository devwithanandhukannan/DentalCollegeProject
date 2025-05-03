import jwt from 'jsonwebtoken';
import { Doctor } from '../models/models.js';
import dotenv from 'dotenv';

dotenv.config();

const DOCTOR_JWT_SECRET = process.env.DOCTOR_JWT_SECRET || 'doctor_default_secret';
export const doctorBlacklistedTokens = new Set();

export const protectDoctor = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    
    if (doctorBlacklistedTokens.has(token)) {
      return res.status(401).json({ message: 'Unauthorized, token blacklisted' });
    }
    try {
      const decoded = jwt.verify(token, DOCTOR_JWT_SECRET);      
      const doctor = await Doctor.findByPk(decoded.doctor_id);
      if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
      req.doctor = { doctor_id: doctor.doctor_id };
      console.log('Doctor verified:', req.doctor);
      
      next();
    } catch (error) {
      console.error('Error verifying doctor token:', error.message);
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

export { DOCTOR_JWT_SECRET };

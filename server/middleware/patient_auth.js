import jwt from 'jsonwebtoken';
import { Patient } from '../models/models.js';
import dotenv from 'dotenv';

dotenv.config();

const PATIENT_JWT_SECRET = process.env.PATIENT_JWT_SECRET || 'patient_default_secret';
export const patientBlacklistedTokens = new Set();

export const protectPatient = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    if (patientBlacklistedTokens.has(token)) {
      return res.status(401).json({ message: 'Unauthorized, token blacklisted' });
    }
    try {
      const decoded = jwt.verify(token, PATIENT_JWT_SECRET);
      const patient = await Patient.findByPk(decoded.patient_id);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      req.patient = { patient_id: patient.patient_id };
      next();
    } catch (error) {
      console.error('Error verifying patient token:', error.message);
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

export { PATIENT_JWT_SECRET };

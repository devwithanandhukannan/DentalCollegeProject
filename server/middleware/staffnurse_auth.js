import jwt from 'jsonwebtoken';
import { StaffNurse } from '../models/models.js';
import dotenv from 'dotenv';

dotenv.config();

const STAFF_JWT_SECRET = process.env.STAFF_JWT_SECRET || 'staff_default_secret';
export const staffBlacklistedTokens = new Set();

export const protectStaff = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    if (staffBlacklistedTokens.has(token)) {
      return res.status(401).json({ message: 'Unauthorized, token blacklisted' });
    }
    try {
      const decoded = jwt.verify(token, STAFF_JWT_SECRET);
      const staffNurse = await StaffNurse.findByPk(decoded.nurse_id);
      if (!staffNurse) return res.status(404).json({ message: 'Staff nurse not found' });
      req.staff = { nurse_id: staffNurse.nurse_id };
      next();
    } catch (error) {
      console.error('Error verifying staff token:', error.message);
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

export { STAFF_JWT_SECRET };

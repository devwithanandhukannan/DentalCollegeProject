import jwt from 'jsonwebtoken';
import { Admin } from '../models/models.js'; // Assuming Admin model exists
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin_default_secret';
export const adminBlacklistedTokens = new Set();

export const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    if (adminBlacklistedTokens.has(token)) {
      return res.status(401).json({ message: 'Unauthorized, token blacklisted' });
    }
    try {
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
      const admin = await Admin.findByPk(decoded.admin_id);
      if (!admin) return res.status(404).json({ message: 'Admin not found' });
      req.admin = { admin_id: admin.admin_id };
      next();
    } catch (error) {
      console.error('Error verifying admin token:', error.message);
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

export { ADMIN_JWT_SECRET };

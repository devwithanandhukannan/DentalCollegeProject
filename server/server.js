import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';
import path from 'path';
import morgan from 'morgan';
import sequelize from './config/db.js';
import adminRoutes from './router/admin_Route.js';
import doctorRoutes from './router/doctor_Route.js';
import patientRoutes from './router/patient_Route.js';
import staffNurseRoutes from './router/staffnurse_Route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logging requests
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Log client IP
app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`🖥 Client IP: ${clientIP}`);
  next();
});

// Routes
app.get('/', (req, res) => res.send('Doctor Booking System API is running...'));
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/patient', patientRoutes);
app.use('/staffnurse', staffNurseRoutes);

// Get Local IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (let interfaceName in interfaces) {
    for (let iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

// Start Server
const startServer = async (port) => {
  try {
    await sequelize.sync({ alter: false }); // Sync without dropping data
    console.log('✅ Database Synced');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on:`);
      console.log(`   - Local: http://localhost:${port}`);
      console.log(`   - Network: http://${getLocalIP()}:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️ Port ${port} in use, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('❌ Server Error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('❌ Database Sync Error:', err);
    process.exit(1);
  }
};

startServer(PORT);

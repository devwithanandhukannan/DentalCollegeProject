import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Admin, Doctor, Specialization, StaffNurse } from '../models/models.js';
import {  ADMIN_JWT_SECRET  } from '../middleware/admin_auth.js';
import dotenv from 'dotenv';

dotenv.config();

// ------------------------------------------------------------------------------------------------------------------------------------------------
                                                  // ADMIN SETTINGS
// ------------------------------------------------------------------------------------------------------------------------------------------------


//////////////////////////////////////////////////// create admin account //////////////////////////////////////////////////////
export const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      return res.status(400).json({ msg: 'Admin already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Admin.create({ name, email, password: hashedPassword });

    res.status(201).json({ msg: 'Admin created successfully' });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


//////////////////////////////////////////////////// admin login //////////////////////////////////////////////////////
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ admin_id: admin.admin_id }, ADMIN_JWT_SECRET, { expiresIn: '1h' });

    // Send response with token and success message
    res.json({
      msg: 'Login successful',
      token: token
    });
  } catch (err) {
    console.error('Error during login:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// admin logout //////////////////////////////////////////////////////
export const adminLogout = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  adminBlacklistedTokens.add(token);
  res.json({ msg: 'Logged out successfully' });
};


//////////////////////////////////////////////////// update admin profile //////////////////////////////////////////////////////
export const updateProfile = async (req, res) => {
  const { name, email, oldPassword, newPassword } = req.body;
  const admin_id = req.admin.admin_id;

  try {
    const admin = await Admin.findByPk(admin_id);

    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    let updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Old password is incorrect' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateFields.password = hashedPassword;
    }

    if (Object.keys(updateFields).length > 0) {
      await admin.update(updateFields);
    }

    res.json({ msg: 'Profile updated successfully' });
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server Error');
  }
};

//////////////////////////////////////////////////// get admin details //////////////////////////////////////////////////////
export const getAdminDetails = async (req, res) => {
  try {
    const admin_id = req.admin.admin_id;

    const admin = await Admin.findByPk(admin_id, {
      attributes: ['admin_id', 'name', 'email'] // Exclude password
    });

    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }

    res.json(admin);
  } catch (err) {
    console.error('Error fetching admin details:', err.message);
    res.status(500).send('Server Error');
  }
};

// ------------------------------------------------------------------------------------------------------------------------------------------------
                                                  // specialization
// ------------------------------------------------------------------------------------------------------------------------------------------------


//////////////////////////////////////////////////// create specialization //////////////////////////////////////////////////////
export const createSpecialization = async (req, res) => {
  const { name } = req.body;

  try {
    // Check if specialization already exists
    const existingSpecialization = await Specialization.findOne({ where: { name } });
    if (existingSpecialization) {
      return res.status(400).json({ msg: 'Specialization already exists' });
    }

    // Create new specialization
    const specialization = await Specialization.create({ name });
    res.status(201).json({ msg: 'Specialization created successfully', specialization });
  } catch (error) {
    console.error('Error creating specialization:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// get all specializations //////////////////////////////////////////////////////
export const getAllSpecializations = async (req, res) => {
  try {
    const specializations = await Specialization.findAll();
    res.json(specializations);
  } catch (error) {
    console.error('Error fetching specializations:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// get specialization by id //////////////////////////////////////////////////////
export const getSpecializationById = async (req, res) => {
  const { id } = req.params;

  try {
    const specialization = await Specialization.findByPk(id);
    if (!specialization) {
      return res.status(404).json({ msg: 'Specialization not found' });
    }
    res.json(specialization);
  } catch (error) {
    console.error('Error fetching specialization:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// update specialization //////////////////////////////////////////////////////
export const updateSpecialization = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const specialization = await Specialization.findByPk(id);
    if (!specialization) {
      return res.status(404).json({ msg: 'Specialization not found' });
    }

    // Check if new name conflicts with another specialization
    if (name && name !== specialization.name) {
      const existingSpecialization = await Specialization.findOne({ where: { name } });
      if (existingSpecialization) {
        return res.status(400).json({ msg: 'Specialization name already exists' });
      }
    }

    await specialization.update({ name: name || specialization.name });
    res.json({ msg: 'Specialization updated successfully', specialization });
  } catch (error) {
    console.error('Error updating specialization:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// delete specialization //////////////////////////////////////////////////////
export const deleteSpecialization = async (req, res) => {
  const { id } = req.params;

  try {
    const specialization = await Specialization.findByPk(id);
    if (!specialization) {
      return res.status(404).json({ msg: 'Specialization not found' });
    }

    await specialization.destroy();
    res.json({ msg: 'Specialization deleted successfully' });
  } catch (error) {
    console.error('Error deleting specialization:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


// ------------------------------------------------------------------------------------------------------------------------------------------------
                                                  // DOCTOR
// ------------------------------------------------------------------------------------------------------------------------------------------------

//////////////////////////////////////////////////// create doctor //////////////////////////////////////////////////////
export const createDoctor = async (req, res) => {
  const { name, email, password, specialization_id } = req.body;

  try {
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ where: { email } });
    if (existingDoctor) {
      return res.status(400).json({ msg: 'Doctor already exists' });
    }

    // Validate specialization_id
    const specialization = await Specialization.findByPk(specialization_id);
    if (!specialization) {
      return res.status(400).json({ msg: 'Invalid specialization_id' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const doctor = await Doctor.create({ name, email, password: hashedPassword, specialization_id });
    res.status(201).json({ msg: 'Doctor created successfully', doctor });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// get all doctors //////////////////////////////////////////////////////
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ model: Specialization, attributes: ['name'] }] // Include specialization name
    });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// get doctor by id //////////////////////////////////////////////////////
export const getDoctorById = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findByPk(id, {
      include: [{ model: Specialization, attributes: ['name'] }]
    });
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// update doctor //////////////////////////////////////////////////////
export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, specialization_id } = req.body;

  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    // Check if new email conflicts with another doctor
    if (email && email !== doctor.email) {
      const existingDoctor = await Doctor.findOne({ where: { email } });
      if (existingDoctor) {
        return res.status(400).json({ msg: 'Email already in use by another doctor' });
      }
    }

    // Validate specialization_id if provided
    if (specialization_id) {
      const specialization = await Specialization.findByPk(specialization_id);
      if (!specialization) {
        return res.status(400).json({ msg: 'Invalid specialization_id' });
      }
    }

    let updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (specialization_id) updateFields.specialization_id = specialization_id;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updateFields).length > 0) {
      await doctor.update(updateFields);
    }

    res.json({ msg: 'Doctor updated successfully', doctor });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// delete doctor //////////////////////////////////////////////////////
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ msg: 'Doctor not found' });
    }

    await doctor.destroy();
    res.json({ msg: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// get all doctors by specialization //////////////////////////////////////////////////////
export const createStaffNurse = async (req, res) => {
  const { name, email, password, assigned_doctor_id } = req.body;

  try {
    // Check if staff nurse already exists
    const existingNurse = await StaffNurse.findOne({ where: { email } });
    if (existingNurse) {
      return res.status(400).json({ msg: 'Staff nurse already exists' });
    }

    // Validate assigned_doctor_id if provided
    if (assigned_doctor_id) {
      const doctor = await Doctor.findByPk(assigned_doctor_id);
      if (!doctor) {
        return res.status(400).json({ msg: 'Invalid assigned_doctor_id' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staffNurse = await StaffNurse.create({
      name,
      email,
      password: hashedPassword,
      assigned_doctor_id
    });
    res.status(201).json({ msg: 'Staff nurse created successfully', staffNurse });
  } catch (error) {
    console.error('Error creating staff nurse:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};



// ------------------------------------------------------------------------------------------------------------------------------------------------
                                                  // NURSE
// ------------------------------------------------------------------------------------------------------------------------------------------------

//////////////////////////////////////////////////// get all staff nurses //////////////////////////////////////////////////////
export const getAllStaffNurses = async (req, res) => {
  try {
    const staffNurses = await StaffNurse.findAll({
      include: [{ model: Doctor, attributes: ['name', 'email'] }] // Include doctor details
    });
    res.json(staffNurses);
  } catch (error) {
    console.error('Error fetching staff nurses:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// get staff nurse by id //////////////////////////////////////////////////////
export const getStaffNurseById = async (req, res) => {
  const { id } = req.params;

  try {
    const staffNurse = await StaffNurse.findByPk(id, {
      include: [{ model: Doctor, attributes: ['name', 'email'] }]
    });
    if (!staffNurse) {
      return res.status(404).json({ msg: 'Staff nurse not found' });
    }
    res.json(staffNurse);
  } catch (error) {
    console.error('Error fetching staff nurse:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// update staff nurse //////////////////////////////////////////////////////
export const updateStaffNurse = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, assigned_doctor_id } = req.body;

  try {
    const staffNurse = await StaffNurse.findByPk(id);
    if (!staffNurse) {
      return res.status(404).json({ msg: 'Staff nurse not found' });
    }

    // Check if new email conflicts with another staff nurse
    if (email && email !== staffNurse.email) {
      const existingNurse = await StaffNurse.findOne({ where: { email } });
      if (existingNurse) {
        return res.status(400).json({ msg: 'Email already in use by another staff nurse' });
      }
    }

    // Validate assigned_doctor_id if provided
    if (assigned_doctor_id !== undefined) {
      if (assigned_doctor_id !== null) {
        const doctor = await Doctor.findByPk(assigned_doctor_id);
        if (!doctor) {
          return res.status(400).json({ msg: 'Invalid assigned_doctor_id' });
        }
      }
    }

    let updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }
    if (assigned_doctor_id !== undefined) updateFields.assigned_doctor_id = assigned_doctor_id;

    if (Object.keys(updateFields).length > 0) {
      await staffNurse.update(updateFields);
    }

    res.json({ msg: 'Staff nurse updated successfully', staffNurse });
  } catch (error) {
    console.error('Error updating staff nurse:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

//////////////////////////////////////////////////// delete staff nurse //////////////////////////////////////////////////////
export const deleteStaffNurse = async (req, res) => {
  const { id } = req.params;

  try {
    const staffNurse = await StaffNurse.findByPk(id);
    if (!staffNurse) {
      return res.status(404).json({ msg: 'Staff nurse not found' });
    }

    await staffNurse.destroy();
    res.json({ msg: 'Staff nurse deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff nurse:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};


import { DataTypes } from 'sequelize';
import sequelize, { Sequelize } from '../config/db.js';


////////////////////////////////// admin //////////////////////////////////
const Admin = sequelize.define('Admin', {
  admin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, { timestamps: false });


////////////////////////////////// specializations //////////////////////////////////
const Specialization = sequelize.define('Specialization', {
  specialization_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  }
}, { timestamps: false });


////////////////////////////////// doctor //////////////////////////////////
const Doctor = sequelize.define('Doctor', {
  doctor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  specialization_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Specialization,
      key: 'specialization_id'
    }
  }
}, { timestamps: false });



////////////////////////////////// staff nurse //////////////////////////////////
const StaffNurse = sequelize.define('StaffNurse', {
  nurse_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  assigned_doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Doctor,
      key: 'doctor_id'
    }
  }
}, { timestamps: false });



////////////////////////////////// patient //////////////////////////////////
const Patient = sequelize.define('Patient', {
  patient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  patient_number: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, { timestamps: false });


////////////////////////////////// slots //////////////////////////////////
const Slot = sequelize.define('Slot', {
  slot_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Doctor,
      key: 'doctor_id'
    }
  },
  slot_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  slots: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, { timestamps: false });



////////////////////////////////// appointment //////////////////////////////////
const Appointment = sequelize.define('Appointment', {
  appointment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Patient,
      key: 'patient_id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Doctor,
      key: 'doctor_id'
    }
  },
  slot_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Slot,
      key: 'slot_id'
    }
  },
  slot_time: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  }
}, { timestamps: false });


////////////////////////////////// report //////////////////////////////////
const Report = sequelize.define('Report', {
  report_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Patient,
      key: 'patient_id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Doctor,
      key: 'doctor_id'
    }
  },
  nurse_id: {
    type: DataTypes.INTEGER,
    references: {
      model: StaffNurse,
      key: 'nurse_id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected', 'Resubmitted','Submitted'),
    defaultValue: 'Pending'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  submission_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { timestamps: false });


////////////////////////////////// note //////////////////////////////////
const Note = sequelize.define('Note', {
  note_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Patient,
      key: 'patient_id'
    }
  },
  creator_type: {
    type: DataTypes.ENUM('Admin', 'Doctor'),
    allowNull: false
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Admin,
      key: 'admin_id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Doctor,
      key: 'doctor_id'
    }
  },
  topic: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { timestamps: false });



////////////////////////////////// patient upload //////////////////////////////////
const PatientUpload = sequelize.define('PatientUpload', {
  upload_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Patient,
      key: 'patient_id'
    }
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { timestamps: false });




////////////////////////////////// backup log //////////////////////////////////
const BackupLog = sequelize.define('BackupLog', {
  backup_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  backup_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, { timestamps: false });

// Define Relationships
Doctor.belongsTo(Specialization, { foreignKey: 'specialization_id' });
StaffNurse.belongsTo(Doctor, { foreignKey: 'assigned_doctor_id' });
Slot.belongsTo(Doctor, { foreignKey: 'doctor_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });
Appointment.belongsTo(Slot, { foreignKey: 'slot_id' });
Report.belongsTo(Patient, { foreignKey: 'patient_id' });
Report.belongsTo(Doctor, { foreignKey: 'doctor_id' });
Report.belongsTo(StaffNurse, { foreignKey: 'nurse_id' });
Note.belongsTo(Patient, { foreignKey: 'patient_id' });
Note.belongsTo(Admin, { foreignKey: 'admin_id' });
Note.belongsTo(Doctor, { foreignKey: 'doctor_id' });
PatientUpload.belongsTo(Patient, { foreignKey: 'patient_id' });

// Sync Database
async function initializeDatabase() {
  try {
    await sequelize.sync({ force: true }); // Use { force: true } to drop and recreate tables (for development only)
    console.log('Database and tables synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
    throw error;
  }
}

export { Admin, Specialization, Doctor, StaffNurse ,Slot ,Appointment , Patient,Report , initializeDatabase };
export default sequelize;
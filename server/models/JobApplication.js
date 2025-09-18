const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  guid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  coverLetter: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  resume: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'applied',
    validate: {
      isIn: [['applied', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'hired']]
    },
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  jobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id',
    },
  },
  applicantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'job_applications',
  timestamps: true,
});

module.exports = JobApplication;

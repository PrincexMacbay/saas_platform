const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  jobType: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'freelance'),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  salaryMin: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  salaryMax: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  salaryCurrency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD',
  },
  experienceLevel: {
    type: DataTypes.ENUM('entry', 'mid', 'senior', 'executive'),
    allowNull: false,
  },
  remoteWork: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'paused', 'closed']]
    },
  },
  applicationDeadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'jobs',
  timestamps: true,
});

module.exports = Job;

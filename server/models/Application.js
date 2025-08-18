const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  referral: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  studentId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  applicationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  paymentInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string for payment information',
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    }
  },
  formData: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string for dynamic form fields',
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'plans',
      key: 'id',
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'Set when application is approved and user is created',
  },
}, {
  tableName: 'applications',
  timestamps: true,
  indexes: [
    {
      fields: ['email'],
    },
    {
      fields: ['planId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = Application;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MembershipSettings = sequelize.define('MembershipSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // General Settings
  autoApproveApplications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  enableApplicationForm: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  allowBankTransfers: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Invoice Settings
  invoiceText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Email Notification Settings
  emailNotifications: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string for email notification preferences',
  },
  // Other Settings
  memberNumberPrefix: {
    type: DataTypes.STRING(10),
    defaultValue: 'MEM',
  },
  memberNumberLength: {
    type: DataTypes.INTEGER,
    defaultValue: 6,
  },
}, {
  tableName: 'membership_settings',
  timestamps: true,
});

module.exports = MembershipSettings;

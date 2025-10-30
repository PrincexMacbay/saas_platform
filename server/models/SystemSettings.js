const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemSettings = sequelize.define('SystemSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  settingKey: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  settingValue: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string for complex settings',
  },
  settingType: {
    type: DataTypes.ENUM('platform', 'email', 'notification', 'feature', 'security'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'system_settings',
  timestamps: true,
  indexes: [
    {
      fields: ['settingKey'],
    },
    {
      fields: ['settingType'],
    },
  ],
});

module.exports = SystemSettings;


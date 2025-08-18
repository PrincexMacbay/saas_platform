const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reminder = sequelize.define('Reminder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  type: {
    type: DataTypes.ENUM('renewal', 'payment_due', 'overdue', 'welcome', 'custom'),
    allowNull: false,
  },
  reminderDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
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
  planId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'plans',
      key: 'id',
    },
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id',
    },
  },
}, {
  tableName: 'reminders',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['planId'],
    },
    {
      fields: ['subscriptionId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['reminderDate'],
    },
  ],
});

module.exports = Reminder;

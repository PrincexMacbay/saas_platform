const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScheduledPayment = sequelize.define('ScheduledPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  frequency: {
    type: DataTypes.ENUM('one-time', 'monthly', 'quarterly', 'yearly'),
    allowNull: false,
    defaultValue: 'one-time',
  },
  status: {
    type: DataTypes.ENUM('pending', 'processed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  description: {
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
  tableName: 'scheduled_payments',
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
      fields: ['scheduledDate'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = ScheduledPayment;

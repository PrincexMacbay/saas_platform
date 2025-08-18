const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['cash', 'bank_transfer', 'credit_card', 'debit_card', 'mobile_payment', 'other']]
    }
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  identifier: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Transaction ID or identifier',
  },
  referenceNumber: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'failed', 'refunded']]
    }
  },
  notes: {
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
  tableName: 'payments',
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
      fields: ['paymentDate'],
    },
  ],
});

module.exports = Payment;

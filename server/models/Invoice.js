const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  invoiceNumber: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  issueDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  invoiceText: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Custom invoice text from settings',
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
  paymentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'payments',
      key: 'id',
    },
  },
}, {
  tableName: 'invoices',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['invoiceNumber'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['planId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['dueDate'],
    },
  ],
});

module.exports = Invoice;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Debt = sequelize.define('Debt', {
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
  issuedOn: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  isManualEntry: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  dataType: {
    type: DataTypes.ENUM('subscription', 'fee', 'penalty', 'other'),
    allowNull: false,
    defaultValue: 'subscription',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('outstanding', 'paid', 'written_off'),
    allowNull: false,
    defaultValue: 'outstanding',
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
  tableName: 'debts',
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
      fields: ['issuedOn'],
    },
  ],
});

module.exports = Debt;

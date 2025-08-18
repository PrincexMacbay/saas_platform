const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memberNumber: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'active', 'past_due', 'cancelled', 'expired']]
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  renewalDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
    allowNull: false,
    references: {
      model: 'plans',
      key: 'id',
    },
  },
}, {
  tableName: 'subscriptions',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['memberNumber'],
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
  ],
});

module.exports = Subscription;

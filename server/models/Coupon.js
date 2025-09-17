const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  couponId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage',
  },
  maxRedemptions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Null means unlimited',
  },
  currentRedemptions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  applicablePlans: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array of plan IDs this coupon applies to',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who created this coupon'
  },
}, {
  tableName: 'coupons',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['couponId'],
    },
    {
      fields: ['isActive'],
    },
    {
      fields: ['expiryDate'],
    },
  ],
});

module.exports = Coupon;

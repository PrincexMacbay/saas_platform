const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DigitalCard = sequelize.define('DigitalCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Card Template Settings
  logo: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  organizationName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  cardTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Membership Card',
  },
  headerText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  footerText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Barcode Settings
  enableBarcode: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  barcodeType: {
    type: DataTypes.ENUM('qr', 'code128', 'code39'),
    defaultValue: 'qr',
  },
  barcodeData: {
    type: DataTypes.ENUM('member_number', 'user_id', 'custom'),
    defaultValue: 'member_number',
  },
  // Colors
  primaryColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#3498db',
    validate: {
      is: /^#[0-9A-F]{6}$/i,
    },
  },
  secondaryColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#2c3e50',
    validate: {
      is: /^#[0-9A-F]{6}$/i,
    },
  },
  textColor: {
    type: DataTypes.STRING(7),
    defaultValue: '#ffffff',
    validate: {
      is: /^#[0-9A-F]{6}$/i,
    },
  },
  // Organization link for templates
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'organizations',
      key: 'id',
    },
    comment: 'Organization this card template belongs to'
  },
  // User-specific card data
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
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
  // Card generation status
  isGenerated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cardImagePath: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  // Template or instance flag
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True for card template, false for user-specific cards',
  },
}, {
  tableName: 'digital_cards',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['subscriptionId'],
    },
    {
      fields: ['isTemplate'],
    },
    {
      fields: ['organizationId'],
    },
  ],
});

module.exports = DigitalCard;

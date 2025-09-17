const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPaymentInfo = sequelize.define('UserPaymentInfo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // Bank Information
  bankName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  routingNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  accountHolderName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  accountType: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      isIn: [['checking', 'savings', 'business']]
    }
  },
  
  // Blockchain Information
  preferredCrypto: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'BTC',
  },
  btcAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ethAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  ltcAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bchAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  xmrAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
  // Payment Gateway Settings
  paymentGateway: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'nowpayments',
    validate: {
      isIn: [['nowpayments', 'btcpay', 'manual']]
    }
  },
  gatewayApiKey: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  gatewayStoreId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  
  // Status and Preferences
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  autoAcceptPayments: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  minimumPaymentAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.01,
  },
  
  // Additional Settings
  paymentInstructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  businessName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  
}, {
  tableName: 'user_payment_info',
  timestamps: true,
  indexes: [
    {
      fields: ['userId'],
    },
    {
      fields: ['paymentGateway'],
    },
    {
      fields: ['isActive'],
    },
  ],
});

module.exports = UserPaymentInfo;

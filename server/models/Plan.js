const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  renewalInterval: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'monthly',
    validate: {
      isIn: [['monthly', 'quarterly', 'yearly', 'one-time']]
    }
  },
  benefits: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'organizations',
      key: 'id',
    },
  },
  // Direct links to application form and digital card template
  applicationFormId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'application_forms',
      key: 'id',
    },
    comment: 'Direct link to specific application form for this plan'
  },
  useDefaultForm: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Use organization default form if true, plan-specific form if false'
  },
  digitalCardTemplateId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'digital_cards',
      key: 'id',
    },
    comment: 'Direct link to digital card template for this plan'
  },
  useDefaultCardTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Use organization default card template if true, plan-specific template if false'
  }
}, {
  tableName: 'plans',
  timestamps: true,
});

module.exports = Plan;

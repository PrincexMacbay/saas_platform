const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ApplicationForm = sequelize.define('ApplicationForm', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Membership Application',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  footer: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  agreement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fields: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON string for dynamic form fields configuration',
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who created this application form'
  },
}, {
  tableName: 'application_forms',
  timestamps: true,
});

module.exports = ApplicationForm;

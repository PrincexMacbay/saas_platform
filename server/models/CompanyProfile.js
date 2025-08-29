const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyProfile = sequelize.define('CompanyProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  companyName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  companyLogo: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  companySize: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'company_profiles',
  timestamps: true,
});

module.exports = CompanyProfile;

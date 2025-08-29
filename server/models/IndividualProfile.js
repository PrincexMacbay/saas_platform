const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IndividualProfile = sequelize.define('IndividualProfile', {
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
  resume: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  workExperience: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  jobPreferences: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'individual_profiles',
  timestamps: true,
});

module.exports = IndividualProfile;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
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
  userType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'organizations',
      key: 'id',
    },
  },
  organizationRole: {
    type: DataTypes.STRING(10),
    allowNull: true,
    validate: {
      isIn: [['admin', 'member']]
    }
  },
}, {
  tableName: 'user_profiles',
  timestamps: true,
});

module.exports = UserProfile;

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membership = sequelize.define('Membership', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 0: request pending, 1: member, 2: admin, 3: moderator, 4: owner
  },
  groupId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    // For role-based permissions
  },
  adminGroupShow: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  spaceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'spaces',
      key: 'id',
    },
  },
}, {
  tableName: 'memberships',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'spaceId'],
    },
  ],
});

module.exports = Membership;
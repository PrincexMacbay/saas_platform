const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  objectModel: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // 'User' or 'Space'
  },
  objectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // ID of the user or space being followed
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'follows',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'objectModel', 'objectId'],
    },
    {
      fields: ['objectModel', 'objectId'],
    },
  ],
});

module.exports = Follow;
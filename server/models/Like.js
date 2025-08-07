const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  objectModel: {
    type: DataTypes.STRING(100),
    allowNull: false,
    // 'Post' or 'Comment'
  },
  objectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // ID of the post or comment being liked
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
  tableName: 'likes',
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

module.exports = Like;
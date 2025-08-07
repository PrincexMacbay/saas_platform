const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  guid: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  visibility: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 0: private, 1: public for space members, 2: public for all
  },
  pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
    allowNull: true,
    references: {
      model: 'spaces',
      key: 'id',
    },
  },
  attachmentUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'posts',
  timestamps: true,
});

module.exports = Post;
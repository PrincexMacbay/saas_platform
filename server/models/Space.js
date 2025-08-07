const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Space = sequelize.define('Space', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING(45),
    allowNull: true,
    unique: true,
    validate: {
      len: [2, 45],
      isAlphanumeric: true,
    },
  },
  joinPolicy: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 0: No self join possible
    // 1: Application required 
    // 2: Free for all
  },
  visibility: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 0: Private (invisible for non-members)
    // 1: Only registered users
    // 2: Public (all users including guests)
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    // 0: disabled, 1: enabled, 2: archived
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#3498db',
  },
  coverImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  autoAddNewMembers: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  defaultContentVisibility: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'spaces',
  timestamps: true,
});

module.exports = Space;
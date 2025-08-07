const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 100],
      isAlphanumeric: true,
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  about: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  profileImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  coverImage: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 0: disabled, 1: enabled, 2: needs approval
  },
  visibility: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 1: registered only, 2: public, 3: hidden
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en',
  },
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC',
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
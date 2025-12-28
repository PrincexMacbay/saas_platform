const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  blockerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who is blocking'
  },
  blockedId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who is being blocked'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional reason for blocking'
  }
}, {
  tableName: 'blocks',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['blockerId', 'blockedId']
    },
    {
      fields: ['blockerId']
    },
    {
      fields: ['blockedId']
    }
  ]
});

Block.associate = (models) => {
  Block.belongsTo(models.User, {
    foreignKey: 'blockerId',
    as: 'blocker'
  });
  Block.belongsTo(models.User, {
    foreignKey: 'blockedId',
    as: 'blocked'
  });
};

module.exports = Block;

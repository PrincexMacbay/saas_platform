const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMessageRead = sequelize.define('GroupMessageRead', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'group_messages',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  readAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'group_message_reads',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['messageId', 'userId']
    },
    {
      fields: ['messageId']
    },
    {
      fields: ['userId']
    }
  ]
});

GroupMessageRead.associate = (models) => {
  GroupMessageRead.belongsTo(models.GroupMessage, {
    foreignKey: 'messageId',
    as: 'message'
  });
  GroupMessageRead.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = GroupMessageRead;

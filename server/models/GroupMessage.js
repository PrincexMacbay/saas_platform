const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMessage = sequelize.define('GroupMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  groupConversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'group_conversations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL to attached file/image'
  },
  attachmentType: {
    type: DataTypes.ENUM('image', 'file', 'video', 'audio'),
    allowNull: true
  }
}, {
  tableName: 'group_messages',
  timestamps: true,
  indexes: [
    {
      fields: ['groupConversationId']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

GroupMessage.associate = (models) => {
  GroupMessage.belongsTo(models.GroupConversation, {
    foreignKey: 'groupConversationId',
    as: 'groupConversation'
  });
  GroupMessage.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
  // Track which users have read this message
  GroupMessage.hasMany(models.GroupMessageRead, {
    foreignKey: 'messageId',
    as: 'readBy',
    onDelete: 'CASCADE'
  });
};

module.exports = GroupMessage;

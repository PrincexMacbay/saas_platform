const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'conversations',
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
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['conversationId']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['read']
    },
    {
      fields: ['createdAt']
    }
  ]
});

Message.associate = (models) => {
  Message.belongsTo(models.Conversation, {
    foreignKey: 'conversationId',
    as: 'conversation'
  });
  Message.belongsTo(models.User, {
    foreignKey: 'senderId',
    as: 'sender'
  });
};

module.exports = Message;

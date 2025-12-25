const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  participant1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  participant2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['participant1Id', 'participant2Id']
    },
    {
      fields: ['participant1Id']
    },
    {
      fields: ['participant2Id']
    },
    {
      fields: ['lastMessageAt']
    }
  ]
});

Conversation.associate = (models) => {
  Conversation.belongsTo(models.User, {
    foreignKey: 'participant1Id',
    as: 'participant1'
  });
  Conversation.belongsTo(models.User, {
    foreignKey: 'participant2Id',
    as: 'participant2'
  });
  Conversation.hasMany(models.Message, {
    foreignKey: 'conversationId',
    as: 'messages',
    onDelete: 'CASCADE'
  });
};

module.exports = Conversation;

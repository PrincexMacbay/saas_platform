const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupConversation = sequelize.define('GroupConversation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Group chat name'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Group description'
  },
  planId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'plans',
      key: 'id'
    },
    onDelete: 'SET NULL',
    comment: 'Associated membership plan (if this is a plan member group)'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who created the group'
  },
  isPlanGroup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if this is an automatic group for plan members'
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Group avatar image URL'
  },
  onlyCreatorCanSend: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'If true, only the group creator can send messages'
  }
}, {
  tableName: 'group_conversations',
  timestamps: true,
  indexes: [
    {
      fields: ['planId']
    },
    {
      fields: ['createdBy']
    },
    {
      fields: ['isPlanGroup']
    },
    {
      fields: ['lastMessageAt']
    }
  ]
});

GroupConversation.associate = (models) => {
  GroupConversation.belongsTo(models.User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });
  GroupConversation.belongsTo(models.Plan, {
    foreignKey: 'planId',
    as: 'plan',
    required: false
  });
  GroupConversation.hasMany(models.GroupMessage, {
    foreignKey: 'groupConversationId',
    as: 'messages',
    onDelete: 'CASCADE'
  });
  GroupConversation.hasMany(models.GroupMember, {
    foreignKey: 'groupConversationId',
    as: 'members',
    onDelete: 'CASCADE'
  });
};

module.exports = GroupConversation;

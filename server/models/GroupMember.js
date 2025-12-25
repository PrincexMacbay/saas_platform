const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    comment: 'Role in the group (admin can manage group)'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastReadAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last time user read messages in this group'
  }
}, {
  tableName: 'group_members',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['groupConversationId', 'userId']
    },
    {
      fields: ['groupConversationId']
    },
    {
      fields: ['userId']
    }
  ]
});

GroupMember.associate = (models) => {
  GroupMember.belongsTo(models.GroupConversation, {
    foreignKey: 'groupConversationId',
    as: 'groupConversation'
  });
  GroupMember.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = GroupMember;

const { Op } = require('sequelize');
const { Conversation, Message, GroupConversation, GroupMessage, GroupMember, GroupMessageRead, User, Plan, Subscription } = require('../models');

// Note: Subscription model uses 'user' as the association alias

// ========== 1-ON-1 CONVERSATIONS ==========

// Get or create conversation between two users
const getOrCreateConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id; // req.user is the User model instance
    const { otherUserId } = req.params;

    if (currentUserId === parseInt(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    // Check if conversation exists
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant1Id: currentUserId, participant2Id: otherUserId },
          { participant1Id: otherUserId, participant2Id: currentUserId }
        ]
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
        }
      ]
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await Conversation.create({
        participant1Id: Math.min(currentUserId, otherUserId),
        participant2Id: Math.max(currentUserId, otherUserId)
      });

      conversation = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: User,
            as: 'participant1',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
          },
          {
            model: User,
            as: 'participant2',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
          }
        ]
      });
    }

    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error getting/creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation',
      error: error.message
    });
  }
};

// Get all conversations for current user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is the User model instance

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'firstName', 'lastName']
          }]
        }
      ],
      order: [['lastMessageAt', 'DESC NULLS LAST'], ['updatedAt', 'DESC']]
    });

    // Format conversations with unread count
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
        const unreadCount = await Message.count({
          where: {
            conversationId: conv.id,
            senderId: { [Op.ne]: userId },
            read: false
          }
        });

        return {
          id: conv.id,
          otherUser,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        };
      })
    );

    res.json({
      success: true,
      data: formattedConversations
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is the User model instance
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a participant
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { participant1Id: userId },
          { participant2Id: userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const offset = (page - 1) * limit;

    const messages = await Message.findAndCountAll({
      where: { conversationId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        messages: messages.rows.reverse(), // Reverse to show oldest first
        pagination: {
          total: messages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(messages.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// ========== GROUP CONVERSATIONS ==========

// Create group conversation (for plan members)
const createGroupConversation = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is the User model instance
    const { name, description, planId, userIds } = req.body;

    // If planId is provided, create group for plan members
    if (planId) {
      // Verify user owns the plan
      const plan = await Plan.findOne({
        where: {
          id: planId,
          createdBy: userId
        }
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Plan not found or you do not have permission'
        });
      }

      // Get all active subscribers for this plan
      const subscriptions = await Subscription.findAll({
        where: {
          planId,
          status: 'active'
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id']
        }]
      });

      const memberIds = subscriptions
        .map(sub => sub.userId)
        .filter(id => id && id !== userId);

      // Create group
      const group = await GroupConversation.create({
        name: name || `${plan.name} Members`,
        description: description || `Group chat for ${plan.name} members`,
        planId,
        createdBy: userId,
        isPlanGroup: true
      });

      // Add creator as admin
      await GroupMember.create({
        groupConversationId: group.id,
        userId,
        role: 'admin'
      });

      // Add all plan members
      const membersToAdd = memberIds.map(memberId => ({
        groupConversationId: group.id,
        userId: memberId,
        role: 'member'
      }));

      if (membersToAdd.length > 0) {
        await GroupMember.bulkCreate(membersToAdd);
      }

      const fullGroup = await GroupConversation.findByPk(group.id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'firstName', 'lastName']
          },
          {
            model: Plan,
            as: 'plan',
            attributes: ['id', 'name']
          },
          {
            model: GroupMember,
            as: 'members',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
            }]
          }
        ]
      });

      return res.json({
        success: true,
        data: fullGroup
      });
    }

    // Regular group creation (manual)
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one member is required'
      });
    }

    // Create group
    const group = await GroupConversation.create({
      name,
      description,
      createdBy: userId,
      isPlanGroup: false
    });

    // Add creator as admin
    await GroupMember.create({
      groupConversationId: group.id,
      userId,
      role: 'admin'
    });

    // Add other members
    const membersToAdd = userIds
      .filter(id => id !== userId)
      .map(memberId => ({
        groupConversationId: group.id,
        userId: memberId,
        role: 'member'
      }));

    if (membersToAdd.length > 0) {
      await GroupMember.bulkCreate(membersToAdd);
    }

    const fullGroup = await GroupConversation.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: GroupMember,
          as: 'members',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
          }]
        }
      ]
    });

    res.json({
      success: true,
      data: fullGroup
    });
  } catch (error) {
    console.error('Error creating group conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group conversation',
      error: error.message
    });
  }
};

// Get all group conversations for current user
const getGroupConversations = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is the User model instance

    const memberships = await GroupMember.findAll({
      where: { userId },
      include: [
        {
          model: GroupConversation,
          as: 'groupConversation',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'username', 'firstName', 'lastName']
            },
            {
              model: Plan,
              as: 'plan',
              attributes: ['id', 'name'],
              required: false
            },
            {
              model: GroupMessage,
              as: 'messages',
              limit: 1,
              order: [['createdAt', 'DESC']],
              include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'firstName', 'lastName']
              }]
            },
            {
              model: GroupMember,
              as: 'members',
              include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
              }]
            }
          ]
        }
      ],
      order: [[{ model: GroupConversation, as: 'groupConversation' }, 'lastMessageAt', 'DESC NULLS LAST']]
    });

    // Format with unread count
    const formattedGroups = await Promise.all(
      memberships.map(async (membership) => {
        const group = membership.groupConversation;
        
        // Count unread messages (messages after user's lastReadAt)
        const lastReadAt = membership.lastReadAt || new Date(0);
        const unreadCount = await GroupMessage.count({
          where: {
            groupConversationId: group.id,
            senderId: { [Op.ne]: userId },
            createdAt: { [Op.gt]: lastReadAt }
          },
          include: [{
            model: GroupMessageRead,
            as: 'readBy',
            where: {
              userId: { [Op.ne]: userId }
            },
            required: false
          }]
        });

        return {
          id: group.id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          plan: group.plan,
          creator: group.creator,
          members: group.members,
          lastMessage: group.messages[0] || null,
          unreadCount,
          role: membership.role,
          lastMessageAt: group.lastMessageAt,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt
        };
      })
    );

    res.json({
      success: true,
      data: formattedGroups
    });
  } catch (error) {
    console.error('Error getting group conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group conversations',
      error: error.message
    });
  }
};

// Get messages for a group conversation
const getGroupMessages = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is the User model instance
    const { groupConversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is a member
    const membership = await GroupMember.findOne({
      where: {
        groupConversationId,
        userId
      }
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Not a member of this group'
      });
    }

    const offset = (page - 1) * limit;

    const messages = await GroupMessage.findAndCountAll({
      where: { groupConversationId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        messages: messages.rows.reverse(), // Reverse to show oldest first
        pagination: {
          total: messages.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(messages.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting group messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group messages',
      error: error.message
    });
  }
};

// Get unread message count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is the User model instance

    // Count unread 1-on-1 messages
    const unreadConversations = await Message.count({
      where: {
        senderId: { [Op.ne]: userId },
        read: false
      },
      include: [{
        model: Conversation,
        as: 'conversation',
        where: {
          [Op.or]: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        }
      }],
      distinct: true,
      col: 'conversationId'
    });

    // Count unread group messages
    const memberships = await GroupMember.findAll({
      where: { userId }
    });

    let unreadGroups = 0;
    for (const membership of memberships) {
      const lastReadAt = membership.lastReadAt || new Date(0);
      const unreadInGroup = await GroupMessage.count({
        where: {
          groupConversationId: membership.groupConversationId,
          senderId: { [Op.ne]: userId },
          createdAt: { [Op.gt]: lastReadAt }
        }
      });

      if (unreadInGroup > 0) {
        unreadGroups++;
      }
    }

    res.json({
      success: true,
      data: {
        conversations: unreadConversations,
        groups: unreadGroups,
        total: unreadConversations + unreadGroups
      }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  createGroupConversation,
  getGroupConversations,
  getGroupMessages,
  getUnreadCount
};

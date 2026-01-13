const { Op } = require('sequelize');
const { Conversation, Message, GroupConversation, GroupMessage, GroupMember, GroupMessageRead, User, Plan, Subscription, Application, Follow, Block } = require('../models');

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

    // Check if user is blocked (either direction) - prevent all messaging if blocked
    const isBlocked = await Block.findOne({
      where: {
        [Op.or]: [
          { blockerId: currentUserId, blockedId: parseInt(otherUserId) },
          { blockerId: parseInt(otherUserId), blockedId: currentUserId }
        ]
      }
    });

    if (isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'You cannot message this user. One of you has blocked the other.'
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

    // Create if doesn't exist - but only if mutual follow exists (for NEW conversations)
    if (!conversation) {
      // For NEW conversations, require mutual follow
      const [currentUserFollowsOther, otherUserFollowsCurrent] = await Promise.all([
        Follow.findOne({
          where: {
            userId: currentUserId,
            objectModel: 'User',
            objectId: parseInt(otherUserId)
          }
        }),
        Follow.findOne({
          where: {
            userId: parseInt(otherUserId),
            objectModel: 'User',
            objectId: currentUserId
          }
        })
      ]);

      if (!currentUserFollowsOther || !otherUserFollowsCurrent) {
        return res.status(403).json({
          success: false,
          message: 'You can only start new conversations with users who follow you and whom you follow (mutual follow required)'
        });
      }

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
    // Include all conversations (blocked users can still see conversations, just can't send)
    const formattedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.participant1Id === userId ? conv.participant2 : conv.participant1;
        
        // Check if user is blocked (either direction) - for UI indication only
        const isBlocked = await Block.findOne({
          where: {
            [Op.or]: [
              { blockerId: userId, blockedId: otherUser.id },
              { blockerId: otherUser.id, blockedId: userId }
            ]
          }
        });

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
          updatedAt: conv.updatedAt,
          isBlocked: !!isBlocked, // Include block status for frontend
          blockedByMe: isBlocked && isBlocked.blockerId === userId,
          blockedByThem: isBlocked && isBlocked.blockerId === otherUser.id
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

    // Note: Blocked users can still view messages, they just can't send new ones
    // Block checking for sending messages is done in the send_message socket handler

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

      // Check if a group already exists for this plan
      let group = await GroupConversation.findOne({
        where: {
          planId,
          isPlanGroup: true
        },
        include: [
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

      if (group) {
        // Group already exists, update members and return existing group
        console.log(`Group already exists for plan ${planId}, updating members...`);
        
        // Get all approved members for this plan
        // Include active subscriptions
        const subscriptions = await Subscription.findAll({
          where: {
            planId,
            status: 'active'
          }
        });

        // Also get approved applications (they might not have subscriptions yet or have pending subscriptions)
        const approvedApplications = await Application.findAll({
          where: {
            planId,
            status: 'approved',
            userId: { [Op.ne]: null }
          },
          attributes: ['userId']
        });

        // Combine subscription user IDs and approved application user IDs
        const subscriptionUserIds = subscriptions
          .map(sub => sub.userId)
          .filter(id => id && id !== userId);
        
        const approvedApplicationUserIds = approvedApplications
          .map(app => app.userId)
          .filter(id => id && id !== userId);

        // Merge and deduplicate member IDs
        const allMemberIds = [...new Set([...subscriptionUserIds, ...approvedApplicationUserIds])];

        // Get current members
        const currentMembers = await GroupMember.findAll({
          where: { groupConversationId: group.id }
        });
        const currentMemberIds = currentMembers.map(m => m.userId);

        // Find members to add (not already in group)
        const membersToAdd = allMemberIds
          .filter(memberId => !currentMemberIds.includes(memberId))
          .map(memberId => ({
            groupConversationId: group.id,
            userId: memberId,
            role: 'member'
          }));

        // Add new members
        if (membersToAdd.length > 0) {
          await GroupMember.bulkCreate(membersToAdd);
          console.log(`Added ${membersToAdd.length} new members to existing group`);
        }

        // Reload group with updated members
        group = await GroupConversation.findByPk(group.id, {
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
          message: 'Group already exists. Members updated.',
          data: group
        });
      }

      // No existing group, create a new one
      // Get all approved members for this plan
      // Include active subscriptions
      const subscriptions = await Subscription.findAll({
        where: {
          planId,
          status: 'active'
        }
      });

      // Also get approved applications (they might not have subscriptions yet or have pending subscriptions)
      const approvedApplications = await Application.findAll({
        where: {
          planId,
          status: 'approved',
          userId: { [Op.ne]: null }
        },
        attributes: ['userId']
      });

      // Combine subscription user IDs and approved application user IDs
      const subscriptionUserIds = subscriptions
        .map(sub => sub.userId)
        .filter(id => id && id !== userId);
      
      const approvedApplicationUserIds = approvedApplications
        .map(app => app.userId)
        .filter(id => id && id !== userId);

      // Merge and deduplicate member IDs
      const allMemberIds = [...new Set([...subscriptionUserIds, ...approvedApplicationUserIds])];

      // Create group
      group = await GroupConversation.create({
        name: name || `${plan.name} Members`,
        description: description || `Group chat for ${plan.name} members`,
        planId,
        createdBy: userId,
        isPlanGroup: true,
        onlyCreatorCanSend: false // Default: all members can send
      });

      // Add creator as admin
      await GroupMember.create({
        groupConversationId: group.id,
        userId,
        role: 'admin'
      });

      // Add all plan members
      const membersToAdd = allMemberIds.map(memberId => ({
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
              attributes: ['id', 'name', 'description', 'avatar', 'createdBy', 'onlyCreatorCanSend', 'lastMessageAt', 'createdAt', 'updatedAt'],
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
          createdBy: group.createdBy,
          onlyCreatorCanSend: group.onlyCreatorCanSend || false,
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

// Remove member from group
const removeGroupMember = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupConversationId, memberId } = req.params;

    // Verify user is the group creator
    const group = await GroupConversation.findByPk(groupConversationId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can remove members'
      });
    }

    // Cannot remove the creator
    if (parseInt(memberId) === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the group creator'
      });
    }

    // Remove member
    const deleted = await GroupMember.destroy({
      where: {
        groupConversationId,
        userId: memberId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in group'
      });
    }

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member',
      error: error.message
    });
  }
};

// Update group settings
const updateGroupSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { groupConversationId } = req.params;
    const { onlyCreatorCanSend } = req.body;

    // Verify user is the group creator
    const group = await GroupConversation.findByPk(groupConversationId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.createdBy !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the group creator can update settings'
      });
    }

    // Update settings
    await group.update({
      onlyCreatorCanSend: onlyCreatorCanSend !== undefined ? onlyCreatorCanSend : group.onlyCreatorCanSend
    });

    const updatedGroup = await GroupConversation.findByPk(groupConversationId, {
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
      data: updatedGroup
    });
  } catch (error) {
    console.error('Error updating group settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group settings',
      error: error.message
    });
  }
};

// Helper function: Create or update group chat for a plan (idempotent)
// This can be called from planController or applicationController
const createOrUpdatePlanGroupChat = async (planId, planCreatorId) => {
  try {
    const { Op } = require('sequelize');
    const { GroupConversation, GroupMember, Subscription, Application, Plan } = require('../models');

    // Verify plan exists
    const plan = await Plan.findOne({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Check if group already exists
    let group = await GroupConversation.findOne({
      where: {
        planId,
        isPlanGroup: true
      }
    });

    // Get all approved members for this plan
    const subscriptions = await Subscription.findAll({
      where: {
        planId,
        status: 'active'
      }
    });

    const approvedApplications = await Application.findAll({
      where: {
        planId,
        status: 'approved',
        userId: { [Op.ne]: null }
      },
      attributes: ['userId']
    });

    // Combine subscription user IDs and approved application user IDs
    const subscriptionUserIds = subscriptions
      .map(sub => sub.userId)
      .filter(id => id && id !== planCreatorId);
    
    const approvedApplicationUserIds = approvedApplications
      .map(app => app.userId)
      .filter(id => id && id !== planCreatorId);

    // Merge and deduplicate member IDs
    const allMemberIds = [...new Set([...subscriptionUserIds, ...approvedApplicationUserIds])];

    if (group) {
      // Group exists, update members
      const currentMembers = await GroupMember.findAll({
        where: { groupConversationId: group.id }
      });
      const currentMemberIds = currentMembers.map(m => m.userId);

      // Find members to add (not already in group)
      const membersToAdd = allMemberIds
        .filter(memberId => !currentMemberIds.includes(memberId))
        .map(memberId => ({
          groupConversationId: group.id,
          userId: memberId,
          role: 'member'
        }));

      if (membersToAdd.length > 0) {
        await GroupMember.bulkCreate(membersToAdd);
      }

      return { group, created: false };
    } else {
      // Create new group
      group = await GroupConversation.create({
        name: `${plan.name} Members`,
        description: `Group chat for ${plan.name} members`,
        planId,
        createdBy: planCreatorId,
        isPlanGroup: true,
        onlyCreatorCanSend: false
      });

      // Add creator as admin
      await GroupMember.create({
        groupConversationId: group.id,
        userId: planCreatorId,
        role: 'admin'
      });

      // Add all plan members
      const membersToAdd = allMemberIds.map(memberId => ({
        groupConversationId: group.id,
        userId: memberId,
        role: 'member'
      }));

      if (membersToAdd.length > 0) {
        await GroupMember.bulkCreate(membersToAdd);
      }

      return { group, created: true };
    }
  } catch (error) {
    console.error('Error in createOrUpdatePlanGroupChat:', error);
    throw error;
  }
};

module.exports = {
  createOrUpdatePlanGroupChat,
  getOrCreateConversation,
  getConversations,
  getMessages,
  createGroupConversation,
  getGroupConversations,
  getGroupMessages,
  getUnreadCount,
  removeGroupMember,
  updateGroupSettings
};

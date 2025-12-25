const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Notification, Conversation, Message, GroupConversation, GroupMessage, GroupMember, GroupMessageRead } = require('../models');

let io;

const initializeSocket = (server) => {
  // Get allowed origins for Socket.io CORS
  const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    'https://social-network-frontend-k0ml.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173'
  ].filter(Boolean); // Remove undefined values

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // JWT uses userId, not id
      const userId = decoded.userId || decoded.id; // Support both for compatibility
      const user = await User.findByPk(userId);
      
      if (!user) {
        console.error('Socket auth: User not found', { userId, decoded });
        return next(new Error('User not found'));
      }
      
      if (user.status !== 1) {
        console.error('Socket auth: User not active', { userId });
        return next(new Error('User account not active'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected to Socket.io`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Mark notification as read
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        await Notification.update(
          { read: true, readAt: new Date() },
          { where: { id: notificationId, userId: socket.userId } }
        );
        socket.emit('notification_read', notificationId);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Mark all notifications as read
    socket.on('mark_all_read', async () => {
      try {
        await Notification.update(
          { read: true, readAt: new Date() },
          { where: { userId: socket.userId, read: false } }
        );
        socket.emit('all_notifications_read');
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
        socket.emit('error', { message: 'Failed to mark all as read' });
      }
    });

    // ========== CHAT EVENTS ==========
    
    // Join conversation room (1-on-1)
    socket.on('join_conversation', async (conversationId) => {
      try {
        // Verify user is a participant
        const conversation = await Conversation.findOne({
          where: {
            id: conversationId,
            [Op.or]: [
              { participant1Id: socket.userId },
              { participant2Id: socket.userId }
            ]
          }
        });
        
        if (conversation) {
          socket.join(`conversation_${conversationId}`);
          console.log(`User ${socket.userId} joined conversation ${conversationId}`);
          socket.emit('conversation_joined', { conversationId });
        } else {
          socket.emit('error', { message: 'Conversation not found or access denied' });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Send message (1-on-1)
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, attachment, attachmentType } = data;
        
        // Verify user is a participant
        const conversation = await Conversation.findOne({
          where: {
            id: conversationId,
            [Op.or]: [
              { participant1Id: socket.userId },
              { participant2Id: socket.userId }
            ]
          }
        });

        if (!conversation) {
          return socket.emit('message_error', { message: 'Conversation not found or access denied' });
        }

        // Create message
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          content,
          attachment,
          attachmentType,
          read: false
        });

        // Load message with sender info
        const fullMessage = await Message.findByPk(message.id, {
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
          }]
        });

        // Update conversation lastMessageAt
        await Conversation.update(
          { lastMessageAt: new Date() },
          { where: { id: conversationId } }
        );

        // Emit to conversation room
        io.to(`conversation_${conversationId}`).emit('new_message', fullMessage);

        // Send notification to other participant
        const otherUserId = conversation.participant1Id === socket.userId 
          ? conversation.participant2Id 
          : conversation.participant1Id;
        
        await sendNotification(
          otherUserId,
          'new_message',
          'New Message',
          `${socket.user.firstName || socket.user.username} sent you a message`,
          `/messages?conversation=${conversationId}`,
          { conversationId, messageId: message.id }
        );

        console.log(`Message sent in conversation ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator (1-on-1)
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username,
        firstName: socket.user.firstName,
        isTyping
      });
    });

    // Mark messages as read (1-on-1)
    socket.on('mark_messages_read', async (conversationId) => {
      try {
        await Message.update(
          { read: true, readAt: new Date() },
          {
            where: {
              conversationId,
              senderId: { [Op.ne]: socket.userId },
              read: false
            }
          }
        );
        
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // ========== GROUP CHAT EVENTS ==========
    
    // Join group conversation
    socket.on('join_group_conversation', async (groupConversationId) => {
      try {
        // Verify user is a member
        const membership = await GroupMember.findOne({
          where: {
            groupConversationId,
            userId: socket.userId
          }
        });
        
        if (membership) {
          socket.join(`group_${groupConversationId}`);
          console.log(`User ${socket.userId} joined group ${groupConversationId}`);
          socket.emit('group_conversation_joined', { groupConversationId });
        } else {
          socket.emit('error', { message: 'Not a member of this group' });
        }
      } catch (error) {
        console.error('Error joining group conversation:', error);
        socket.emit('error', { message: 'Failed to join group conversation' });
      }
    });

    // Leave group conversation
    socket.on('leave_group_conversation', (groupConversationId) => {
      socket.leave(`group_${groupConversationId}`);
      console.log(`User ${socket.userId} left group ${groupConversationId}`);
    });

    // Send group message
    socket.on('send_group_message', async (data) => {
      try {
        const { groupConversationId, content, attachment, attachmentType } = data;
        
        // Verify user is a member
        const membership = await GroupMember.findOne({
          where: {
            groupConversationId,
            userId: socket.userId
          }
        });

        if (!membership) {
          return socket.emit('message_error', { message: 'Not a member of this group' });
        }

        // Create message
        const message = await GroupMessage.create({
          groupConversationId,
          senderId: socket.userId,
          content,
          attachment,
          attachmentType
        });

        // Load message with sender and group info
        const fullMessage = await GroupMessage.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'username', 'firstName', 'lastName', 'profileImage']
            },
            {
              model: GroupConversation,
              as: 'groupConversation',
              attributes: ['id', 'name']
            }
          ]
        });

        // Update group lastMessageAt
        await GroupConversation.update(
          { lastMessageAt: new Date() },
          { where: { id: groupConversationId } }
        );

        // Emit to group room
        io.to(`group_${groupConversationId}`).emit('new_group_message', fullMessage);

        // Send notifications to other members (except sender)
        const members = await GroupMember.findAll({
          where: {
            groupConversationId,
            userId: { [Op.ne]: socket.userId }
          },
          include: [{
            model: User,
            as: 'user',
            attributes: ['id']
          }]
        });

        for (const member of members) {
          await sendNotification(
            member.userId,
            'new_group_message',
            'New Group Message',
            `${socket.user.firstName || socket.user.username} sent a message in ${fullMessage.groupConversation?.name || 'the group'}`,
            `/messages?group=${groupConversationId}`,
            { groupConversationId, messageId: message.id }
          );
        }

        console.log(`Group message sent in group ${groupConversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending group message:', error);
        socket.emit('message_error', { message: 'Failed to send group message' });
      }
    });

    // Group typing indicator
    socket.on('group_typing', (data) => {
      const { groupConversationId, isTyping } = data;
      socket.to(`group_${groupConversationId}`).emit('user_typing_group', {
        userId: socket.userId,
        username: socket.user.username,
        firstName: socket.user.firstName,
        isTyping
      });
    });

    // Mark group messages as read
    socket.on('mark_group_messages_read', async (groupConversationId) => {
      try {
        // Get all unread messages in this group
        const unreadMessages = await GroupMessage.findAll({
          where: {
            groupConversationId,
            senderId: { [Op.ne]: socket.userId }
          },
          include: [{
            model: GroupMessageRead,
            as: 'readBy',
            where: {
              userId: { [Op.ne]: socket.userId }
            },
            required: false
          }]
        });

        // Mark messages as read
        const messageIds = unreadMessages
          .filter(msg => !msg.readBy || msg.readBy.length === 0)
          .map(msg => msg.id);

        if (messageIds.length > 0) {
          await GroupMessageRead.bulkCreate(
            messageIds.map(messageId => ({
              messageId,
              userId: socket.userId,
              readAt: new Date()
            }))
          );
        }

        // Update member's lastReadAt
        await GroupMember.update(
          { lastReadAt: new Date() },
          {
            where: {
              groupConversationId,
              userId: socket.userId
            }
          }
        );

        socket.to(`group_${groupConversationId}`).emit('group_messages_read', {
          groupConversationId,
          userId: socket.userId
        });
      } catch (error) {
        console.error('Error marking group messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected from Socket.io`);
    });
  });

  return io;
};

// Helper function to send notification
const sendNotification = async (userId, type, title, message, link = null, metadata = null) => {
  try {
    console.log('📬 sendNotification called:', { userId, type, title });
    
    if (!userId) {
      console.error('❌ sendNotification: userId is required');
      return null;
    }

    // Create notification in database
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      metadata,
      read: false
    });

    console.log('✅ Notification created in DB:', notification.id);

    // Load notification with user association for full data
    const fullNotification = await Notification.findByPk(notification.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    // Emit to user's room
    if (io) {
      const roomName = `user_${userId}`;
      const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
      const userCount = socketsInRoom ? socketsInRoom.size : 0;
      
      console.log(`📡 Emitting notification to room ${roomName} (${userCount} user(s) connected)`);
      
      io.to(roomName).emit('new_notification', fullNotification);
      
      if (userCount === 0) {
        console.log('⚠️ No users connected to receive notification, but saved to DB');
      }
    } else {
      console.log('⚠️ Socket.io not initialized, notification saved to DB only');
    }

    return fullNotification;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  initializeSocket,
  sendNotification,
  getIO: () => io
};

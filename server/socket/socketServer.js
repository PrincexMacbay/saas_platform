const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Notification } = require('../models');

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

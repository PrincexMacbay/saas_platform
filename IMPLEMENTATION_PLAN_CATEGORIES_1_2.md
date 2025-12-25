# 🚀 Implementation Plan: Categories 1 & 2
## Real-Time Features + Security & Authentication Enhancements

This document provides a step-by-step implementation guide for:
- **Category 1**: Real-Time Features (Notifications, Chat, Live Activity)
- **Category 2**: Security & Authentication (2FA, OAuth/SSO, Session Management)

---

## 📋 **IMPLEMENTATION ORDER & TIMELINE**

### **Phase 1: Foundation (Week 1-2)**
1. Real-Time Notifications System
2. Two-Factor Authentication (2FA)

### **Phase 2: Enhancement (Week 3-4)**
3. Session Management
4. Live Activity Feed

### **Phase 3: Advanced (Week 5-6)**
5. Real-Time Chat/Messaging
6. OAuth/SSO Integration (Optional - if time permits)

---

## 🎯 **CATEGORY 1: REAL-TIME FEATURES**

### **1.1 Real-Time Notifications System** 🔥

#### **Step 1: Database Setup**

Create the Notification model:

```javascript
// server/models/Notification.js
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    type: {
      type: DataTypes.ENUM(
        'application_submitted',
        'application_approved',
        'application_rejected',
        'new_comment',
        'new_follower',
        'payment_received',
        'payment_due',
        'job_application_status',
        'space_invitation',
        'mention',
        'post_liked',
        'comment_liked'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true // Store additional data like postId, userId, etc.
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Notification;
};
```

**Migration Command:**
```bash
# Run this in your database or create a migration file
```

#### **Step 2: Install Dependencies**

```bash
cd server
npm install socket.io socket.io-client
npm install --save-dev @types/socket.io
```

#### **Step 3: Backend - Socket.io Server Setup**

```javascript
// server/socket/socketServer.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Notification } = require('../models');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
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
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Mark notifications as read
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        await Notification.update(
          { read: true, readAt: new Date() },
          { where: { id: notificationId, userId: socket.userId } }
        );
        socket.emit('notification_read', notificationId);
      } catch (error) {
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
        socket.emit('error', { message: 'Failed to mark all as read' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Helper function to send notification
const sendNotification = async (userId, type, title, message, link = null, metadata = null) => {
  try {
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

    // Emit to user's room
    if (io) {
      io.to(`user_${userId}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

module.exports = {
  initializeSocket,
  sendNotification,
  getIO: () => io
};
```

#### **Step 4: Integrate Socket.io with Express Server**

```javascript
// server/app.js (add this)
const http = require('http');
const { initializeSocket } = require('./socket/socketServer');

// ... existing code ...

const server = http.createServer(app);
initializeSocket(server);

// Change app.listen to server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### **Step 5: Notification Service Layer**

```javascript
// server/services/notificationService.js
const { sendNotification } = require('../socket/socketServer');
const { User, Post, Comment, Application, Space, JobApplication } = require('../models');

class NotificationService {
  // Application notifications
  async notifyApplicationSubmitted(applicationId) {
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Plan, as: 'plan' }]
    });
    
    // Notify plan creator
    await sendNotification(
      application.plan.createdBy,
      'application_submitted',
      'New Membership Application',
      `A new application has been submitted for ${application.plan.name}`,
      `/admin?section=memberships&applicationId=${applicationId}`,
      { applicationId, planId: application.planId }
    );
  }

  async notifyApplicationApproved(applicationId) {
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Plan, as: 'plan' }]
    });
    
    await sendNotification(
      application.userId,
      'application_approved',
      'Application Approved!',
      `Your application for ${application.plan.name} has been approved`,
      `/membership`,
      { applicationId, planId: application.planId }
    );
  }

  async notifyApplicationRejected(applicationId) {
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Plan, as: 'plan' }]
    });
    
    await sendNotification(
      application.userId,
      'application_rejected',
      'Application Update',
      `Your application for ${application.plan.name} was not approved`,
      `/membership`,
      { applicationId, planId: application.planId }
    );
  }

  // Social notifications
  async notifyNewComment(postId, commentId, commenterId) {
    const post = await Post.findByPk(postId, {
      include: [{ model: User, as: 'author' }]
    });
    const commenter = await User.findByPk(commenterId);

    // Don't notify if user commented on their own post
    if (post.authorId === commenterId) return;

    await sendNotification(
      post.authorId,
      'new_comment',
      'New Comment',
      `${commenter.firstName || commenter.username} commented on your post`,
      `/posts/${postId}`,
      { postId, commentId, commenterId }
    );
  }

  async notifyNewFollower(followerId, followedUserId) {
    const follower = await User.findByPk(followerId);

    await sendNotification(
      followedUserId,
      'new_follower',
      'New Follower',
      `${follower.firstName || follower.username} started following you`,
      `/profile/${follower.username}`,
      { followerId }
    );
  }

  async notifyPostLiked(postId, likerId) {
    const post = await Post.findByPk(postId, { include: [{ model: User, as: 'author' }] });
    const liker = await User.findByPk(likerId);

    if (post.authorId === likerId) return;

    await sendNotification(
      post.authorId,
      'post_liked',
      'Post Liked',
      `${liker.firstName || liker.username} liked your post`,
      `/posts/${postId}`,
      { postId, likerId }
    );
  }

  // Payment notifications
  async notifyPaymentReceived(paymentId) {
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: User, as: 'user' },
        { model: Plan, as: 'plan' }
      ]
    });

    await sendNotification(
      payment.userId,
      'payment_received',
      'Payment Received',
      `Your payment of $${payment.amount} for ${payment.plan.name} has been received`,
      `/membership/payments`,
      { paymentId }
    );
  }

  // Job application notifications
  async notifyJobApplicationStatus(jobApplicationId, status) {
    const jobApplication = await JobApplication.findByPk(jobApplicationId, {
      include: [
        { model: User, as: 'applicant' },
        { model: Job, as: 'job' }
      ]
    });

    const statusMessages = {
      'reviewing': 'Your application is being reviewed',
      'shortlisted': 'Congratulations! You\'ve been shortlisted',
      'interview': 'You\'ve been selected for an interview',
      'rejected': 'Your application was not selected',
      'accepted': 'Congratulations! You\'ve been accepted'
    };

    await sendNotification(
      jobApplication.applicantId,
      'job_application_status',
      'Job Application Update',
      `${statusMessages[status]} for ${jobApplication.job.title}`,
      `/career/applications/${jobApplicationId}`,
      { jobApplicationId, status }
    );
  }
}

module.exports = new NotificationService();
```

#### **Step 6: Notification Controller**

```javascript
// server/controllers/notificationController.js
const { Notification } = require('../models');
const { Op } = require('sequelize');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      userId: req.user.id
    };

    if (unreadOnly === 'true') {
      whereClause.read = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        notifications: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        unreadCount: await Notification.count({
          where: { userId: req.user.id, read: false }
        })
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.update(
      { read: true, readAt: new Date() },
      { where: { id, userId: req.user.id } }
    );

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true, readAt: new Date() },
      { where: { userId: req.user.id, read: false } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.destroy({
      where: { id, userId: req.user.id }
    });

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
```

#### **Step 7: Notification Routes**

```javascript
// server/routes/notifications.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

router.get('/', authenticate, getNotifications);
router.put('/:id/read', authenticate, markAsRead);
router.put('/read-all', authenticate, markAllAsRead);
router.delete('/:id', authenticate, deleteNotification);

module.exports = router;
```

#### **Step 8: Frontend - Socket.io Client Setup**

```bash
cd client
npm install socket.io-client
```

```javascript
// client/src/utils/socket.js
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

let socket = null;

export const initializeSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
    auth: {
      token: token
    },
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
```

#### **Step 9: Frontend - Notification Context**

```javascript
// client/src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { initializeSocket, disconnectSocket, getSocket } from '../utils/socket';
import axios from 'axios';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const socket = initializeSocket(token);

      // Listen for new notifications
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      // Load initial notifications
      loadNotifications();

      return () => {
        socket.off('new_notification');
        disconnectSocket();
      };
    }
  }, [user, token]);

  const loadNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data.data.notifications);
      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Emit to socket
      const socket = getSocket();
      if (socket) {
        socket.emit('mark_notification_read', notificationId);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Emit to socket
      const socket = getSocket();
      if (socket) {
        socket.emit('mark_all_read');
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId);
        return notification && !notification.read ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
```

#### **Step 10: Frontend - Notification Bell Component**

```javascript
// client/src/components/NotificationBell.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Link } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <Link
                  key={notification.id}
                  to={notification.link || '#'}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </Link>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <Link to="/notifications" className="view-all-notifications">
              View all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
```

#### **Step 11: Add Notification Bell to Navbar**

```javascript
// client/src/components/Navbar.jsx
// Add this import
import NotificationBell from './NotificationBell';

// Add this in the authenticated navbar section (after LanguageSelector)
<NotificationBell />
```

---

### **1.2 Real-Time Chat/Messaging System** ⭐ 

#### **Step 1: Database Models**

```javascript
// server/models/Conversation.js
module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    participant1Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    participant2Id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
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
      as: 'messages'
    });
  };

  return Conversation;
};

// server/models/Message.js
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'conversations', key: 'id' },
      onDelete: 'CASCADE'
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
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
      allowNull: true
    }
  }, {
    tableName: 'messages',
    timestamps: true
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

  return Message;
};
```

#### **Step 2: Chat Socket Events**

Add to `server/socket/socketServer.js`:

```javascript
// Add chat room handling
io.on('connection', (socket) => {
  // ... existing code ...

  // Join conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, content, attachment } = data;
      
      // Create message in database
      const message = await Message.create({
        conversationId,
        senderId: socket.userId,
        content,
        attachment,
        read: false
      });

      // Update conversation lastMessageAt
      await Conversation.update(
        { lastMessageAt: new Date() },
        { where: { id: conversationId } }
      );

      // Emit to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', message);

      // Emit notification to other participant
      const conversation = await Conversation.findByPk(conversationId);
      const otherUserId = conversation.participant1Id === socket.userId 
        ? conversation.participant2Id 
        : conversation.participant1Id;
      
      // Send notification
      await sendNotification(
        otherUserId,
        'new_message',
        'New Message',
        `${socket.user.firstName || socket.user.username} sent you a message`,
        `/messages/${conversationId}`,
        { conversationId, messageId: message.id }
      );
    } catch (error) {
      socket.emit('message_error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      isTyping: data.isTyping
    });
  });

  // Mark messages as read
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
});
```

---

### **1.3 Live Activity Feed** ⭐

Add to existing socket server:

```javascript
// Broadcast post activity
const broadcastPostActivity = (postId, activityType, userId) => {
  io.emit('post_activity', {
    postId,
    activityType, // 'like', 'comment', 'view'
    userId,
    timestamp: new Date()
  });
};

// Broadcast space activity
const broadcastSpaceActivity = (spaceId, activityType, userId) => {
  io.to(`space_${spaceId}`).emit('space_activity', {
    spaceId,
    activityType,
    userId,
    timestamp: new Date()
  });
};
```

---

## 🔐 **CATEGORY 2: SECURITY & AUTHENTICATION**

### **2.1 Two-Factor Authentication (2FA)** 🔥

#### **Step 1: Install Dependencies**

```bash
cd server
npm install speakeasy qrcode
```

#### **Step 2: Database - Add 2FA Fields to User Model**

```javascript
// Add to server/models/User.js
twoFactorEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false
},
twoFactorSecret: {
  type: DataTypes.STRING(255),
  allowNull: true
},
twoFactorBackupCodes: {
  type: DataTypes.JSONB,
  allowNull: true
}
```

#### **Step 3: 2FA Service**

```javascript
// server/services/twoFactorService.js
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

class TwoFactorService {
  // Generate secret for user
  generateSecret(userEmail) {
    return speakeasy.generateSecret({
      name: `SaaS Platform (${userEmail})`,
      issuer: 'SaaS Platform'
    });
  }

  // Generate QR code
  async generateQRCode(secret) {
    try {
      const otpAuthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: secret.name,
        issuer: secret.issuer,
        encoding: 'base32'
      });

      const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);
      return qrCodeUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify token
  verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (60 seconds) before/after
    });
  }

  // Generate backup codes
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Verify backup code
  verifyBackupCode(backupCodes, code) {
    const index = backupCodes.indexOf(code.toUpperCase());
    if (index !== -1) {
      backupCodes.splice(index, 1);
      return { valid: true, updatedCodes: backupCodes };
    }
    return { valid: false, updatedCodes: backupCodes };
  }
}

module.exports = new TwoFactorService();
```

#### **Step 4: 2FA Controller**

```javascript
// server/controllers/twoFactorController.js
const { User } = require('../models');
const twoFactorService = require('../services/twoFactorService');

// Setup 2FA
const setup2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    const secret = twoFactorService.generateSecret(user.email);
    const qrCode = await twoFactorService.generateQRCode(secret);
    const backupCodes = twoFactorService.generateBackupCodes();

    // Store secret temporarily (user needs to verify before enabling)
    await user.update({
      twoFactorSecret: secret.base32,
      twoFactorBackupCodes: backupCodes
    });

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode,
        backupCodes
      }
    });
  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA',
      error: error.message
    });
  }
};

// Verify and enable 2FA
const verifyAndEnable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: '2FA setup not initiated'
      });
    }

    const isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    await user.update({
      twoFactorEnabled: true
    });

    res.json({
      success: true,
      message: '2FA enabled successfully',
      data: {
        backupCodes: user.twoFactorBackupCodes
      }
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA',
      error: error.message
    });
  }
};

// Disable 2FA
const disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findByPk(req.user.id);

    // Verify password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null
    });

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: error.message
    });
  }
};

// Verify 2FA token during login
const verify2FAToken = async (req, res) => {
  try {
    const { token, backupCode } = req.body;
    const { userId } = req.session; // Store userId in session during login

    const user = await User.findByPk(userId);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account'
      });
    }

    let isValid = false;

    if (backupCode) {
      // Verify backup code
      const result = twoFactorService.verifyBackupCode(
        user.twoFactorBackupCodes || [],
        backupCode
      );
      isValid = result.valid;
      if (result.valid) {
        await user.update({ twoFactorBackupCodes: result.updatedCodes });
      }
    } else if (token) {
      // Verify TOTP token
      isValid = twoFactorService.verifyToken(user.twoFactorSecret, token);
    }

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Continue with login (generate JWT, etc.)
    // ... existing login logic ...

    res.json({
      success: true,
      message: '2FA verified successfully'
    });
  } catch (error) {
    console.error('Verify 2FA token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA token',
      error: error.message
    });
  }
};

module.exports = {
  setup2FA,
  verifyAndEnable2FA,
  disable2FA,
  verify2FAToken
};
```

#### **Step 5: Update Auth Controller for 2FA**

```javascript
// server/controllers/authController.js
// Modify login function to check for 2FA

const login = async (req, res) => {
  try {
    // ... existing login validation ...

    if (user.twoFactorEnabled) {
      // Store user ID in session for 2FA verification
      req.session.tempUserId = user.id;
      return res.json({
        success: true,
        requires2FA: true,
        message: 'Please enter your 2FA code'
      });
    }

    // ... continue with normal login ...
  } catch (error) {
    // ... error handling ...
  }
};
```

---

### **2.2 OAuth/SSO Integration** ⭐

#### **Step 1: Install Dependencies**

```bash
cd server
npm install passport passport-google-oauth20 passport-github2
```

#### **Step 2: OAuth Service**

```javascript
// server/services/oauthService.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { User } = require('../models');

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      where: { email: profile.emails[0].value }
    });

    if (!user) {
      // Create new user
      user = await User.create({
        email: profile.emails[0].value,
        username: profile.displayName.toLowerCase().replace(/\s+/g, '_'),
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        profileImage: profile.photos[0].value,
        emailVerified: true,
        oauthProvider: 'google',
        oauthId: profile.id
      });
    } else {
      // Link OAuth account
      await user.update({
        oauthProvider: 'google',
        oauthId: profile.id
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({
      where: { email: profile.emails?.[0]?.value }
    });

    if (!user) {
      user = await User.create({
        email: profile.emails?.[0]?.value || `${profile.username}@github.local`,
        username: profile.username,
        firstName: profile.displayName || profile.username,
        emailVerified: true,
        oauthProvider: 'github',
        oauthId: profile.id
      });
    } else {
      await user.update({
        oauthProvider: 'github',
        oauthId: profile.id
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

module.exports = passport;
```

---

### **2.3 Session Management** 🔥

#### **Step 1: Session Model**

```javascript
// server/models/Session.js
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'sessions',
    timestamps: true
  });

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Session;
};
```

#### **Step 2: Session Controller**

```javascript
// server/controllers/sessionController.js
const { Session } = require('../models');

// Get user's active sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll({
      where: {
        userId: req.user.id,
        expiresAt: { [Op.gt]: new Date() }
      },
      order: [['lastActivity', 'DESC']]
    });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

// Revoke session
const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;

    await Session.destroy({
      where: {
        id,
        userId: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Session revoked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session',
      error: error.message
    });
  }
};

// Revoke all other sessions
const revokeAllOtherSessions = async (req, res) => {
  try {
    const currentToken = req.headers.authorization?.split(' ')[1];

    await Session.destroy({
      where: {
        userId: req.user.id,
        token: { [Op.ne]: currentToken }
      }
    });

    res.json({
      success: true,
      message: 'All other sessions revoked'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions',
      error: error.message
    });
  }
};

module.exports = {
  getSessions,
  revokeSession,
  revokeAllOtherSessions
};
```

---

## ✅ **CHECKLIST**

### **Week 1-2: Real-Time Notifications**
- [ ] Create Notification model
- [ ] Install Socket.io
- [ ] Setup Socket.io server
- [ ] Create notification service
- [ ] Create notification controller & routes
- [ ] Frontend: Socket.io client setup
- [ ] Frontend: Notification context
- [ ] Frontend: Notification bell component
- [ ] Integrate notifications into existing features
- [ ] Test notifications for all events

### **Week 2-3: Two-Factor Authentication**
- [ ] Add 2FA fields to User model
- [ ] Install speakeasy & qrcode
- [ ] Create 2FA service
- [ ] Create 2FA controller & routes
- [ ] Update login flow for 2FA
- [ ] Frontend: 2FA setup page
- [ ] Frontend: 2FA verification during login
- [ ] Frontend: 2FA settings page
- [ ] Test 2FA flow

### **Week 3-4: Session Management**
- [ ] Create Session model
- [ ] Create session controller & routes
- [ ] Update auth to track sessions
- [ ] Frontend: Active sessions page
- [ ] Frontend: Session management UI
- [ ] Test session revocation

### **Week 4-5: Live Activity Feed**
- [ ] Add activity broadcasting to socket server
- [ ] Frontend: Live activity indicators
- [ ] Frontend: Real-time counters
- [ ] Test live updates

### **Week 5-6: Real-Time Chat (Optional)**
- [ ] Create Conversation & Message models
- [ ] Add chat socket events
- [ ] Create chat controller & routes
- [ ] Frontend: Chat component
- [ ] Frontend: Message list
- [ ] Frontend: Typing indicators
- [ ] Test chat functionality

---

## 🎯 **NEXT STEPS**

1. **Start with Real-Time Notifications** - Highest impact, good learning
2. **Then 2FA** - Security feature, quick win
3. **Session Management** - Completes security suite
4. **Live Activity** - Enhances real-time features
5. **Chat** - Advanced feature if time permits

---

## 📚 **RESOURCES**

- Socket.io Docs: https://socket.io/docs/
- Speakeasy (2FA): https://github.com/speakeasyjs/speakeasy
- Passport.js: http://www.passportjs.org/

---

**Good luck with your implementation! 🚀**

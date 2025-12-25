const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/auth');

// 1-on-1 Conversations
router.get('/conversations', authenticateToken, chatController.getConversations);
// This route must come before /:conversationId/messages to avoid route conflicts
router.get('/conversations/user/:otherUserId', authenticateToken, chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', authenticateToken, chatController.getMessages);

// Group Conversations
router.post('/groups', authenticateToken, chatController.createGroupConversation);
router.get('/groups', authenticateToken, chatController.getGroupConversations);
router.get('/groups/:groupConversationId/messages', authenticateToken, chatController.getGroupMessages);

// Unread count
router.get('/unread-count', authenticateToken, chatController.getUnreadCount);

module.exports = router;

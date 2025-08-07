const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public/optional auth routes
router.get('/', optionalAuth, postController.getPosts);
router.get('/:postid', optionalAuth, postController.getPost);

// Protected routes
router.post('/', authenticateToken, postController.createPost);
router.post('/:postid/comments', authenticateToken, postController.createComment);
router.post('/:objectmodel/:objectid/like', authenticateToken, postController.toggleLike);

module.exports = router;
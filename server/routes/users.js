const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public/optional auth routes
router.get('/', optionalAuth, userController.getUsers);
router.get('/:userid', optionalAuth, userController.getUser);

// Protected routes
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/:userid/follow', authenticateToken, userController.toggleFollow);

module.exports = router;
const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public/optional auth routes
router.get('/', optionalAuth, spaceController.getSpaces);
router.get('/:identifier', optionalAuth, spaceController.getSpace);

// Protected routes
router.post('/', authenticateToken, spaceController.createSpace);
router.post('/:identifier/join', authenticateToken, spaceController.joinSpace);
router.post('/:identifier/leave', authenticateToken, spaceController.leaveSpace);
router.post('/:identifier/follow', authenticateToken, spaceController.toggleFollowSpace);

module.exports = router;
const express = require('express');
const router = express.Router();
const spaceController = require('../controllers/spaceController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public/optional auth routes
router.get('/', optionalAuth, spaceController.getSpaces);
router.get('/:spaceId', optionalAuth, spaceController.getSpace);

// Protected routes
router.post('/', authenticateToken, spaceController.createSpace);
router.post('/:spaceId/join', authenticateToken, spaceController.joinSpace);
router.post('/:spaceId/leave', authenticateToken, spaceController.leaveSpace);
router.post('/:spaceId/follow', authenticateToken, spaceController.toggleFollowSpace);

module.exports = router;
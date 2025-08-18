const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public/optional auth routes
router.get('/', optionalAuth, userController.getUsers);
router.get('/:identifier', optionalAuth, userController.getUser);
router.get('/:userid/followers', optionalAuth, userController.getFollowers);
router.get('/:userid/following', optionalAuth, userController.getFollowing);

// Protected routes
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/:userid/follow', authenticateToken, userController.toggleFollow);

// Organization routes
router.get('/organizations/available', authenticateToken, userController.getAvailableOrganizations);
router.post('/organizations/join', authenticateToken, userController.joinOrganization);
router.post('/organizations/leave', authenticateToken, userController.leaveOrganization);

// Test endpoint to check if user exists
router.get('/test/:username', async (req, res) => {
  try {
    const { User } = require('../models');
    const { username } = req.params;
    console.log(`Testing if user exists: ${username}`);
    
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'email', 'firstName', 'lastName']
    });
    
    if (user) {
      res.json({
        success: true,
        message: 'User found',
        data: user
      });
    } else {
      res.json({
        success: false,
        message: 'User not found',
        data: null
      });
    }
  } catch (error) {
    console.error('Test user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing user',
      error: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const spaceRoutes = require('./spaces');
const postRoutes = require('./posts');
const uploadRoutes = require('./upload');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/spaces', spaceRoutes);
router.use('/posts', postRoutes);
router.use('/upload', uploadRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Social Network API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;

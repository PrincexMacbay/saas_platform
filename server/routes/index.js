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
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      dbDialect: process.env.DB_DIALECT,
      dbHost: process.env.DB_HOST,
      dbName: process.env.DB_NAME,
    }
  });
});

// Test registration endpoint
router.post('/test-register', (req, res) => {
  console.log('=== TEST REGISTRATION ===');
  console.log('Request body:', req.body);
  console.log('Headers:', req.headers);
  
  res.json({
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const spaceRoutes = require('./spaces');
const postRoutes = require('./posts');
const uploadRoutes = require('./upload');
const careerRoutes = require('./career');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/spaces', spaceRoutes);
router.use('/posts', postRoutes);
router.use('/upload', uploadRoutes);
router.use('/career', careerRoutes);

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
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('- DB_DIALECT:', process.env.DB_DIALECT);
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_NAME:', process.env.DB_NAME);
  
  res.json({
    success: true,
    message: 'Test endpoint working',
    receivedData: req.body,
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasJwtSecret: !!process.env.JWT_SECRET,
      dbDialect: process.env.DB_DIALECT,
      dbHost: process.env.DB_HOST,
      dbName: process.env.DB_NAME,
    }
  });
});

// Test registration validation endpoint
router.post('/test-register-validation', async (req, res) => {
  try {
    console.log('=== TEST REGISTRATION VALIDATION ===');
    console.log('Request body:', req.body);
    
    const { username, email, password, firstName, lastName } = req.body;
    
    // Test validation rules
    const validationErrors = [];
    
    if (!username || username.length < 3 || username.length > 100) {
      validationErrors.push({
        field: 'username',
        message: 'Username must be between 3 and 100 characters'
      });
    }
    
    if (!email || !email.includes('@')) {
      validationErrors.push({
        field: 'email',
        message: 'Please provide a valid email'
      });
    }
    
    if (!password || password.length < 6) {
      validationErrors.push({
        field: 'password',
        message: 'Password must be at least 6 characters long'
      });
    }
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    res.json({
      success: true,
      message: 'Validation passed',
      data: { username, email, firstName, lastName }
    });
  } catch (error) {
    console.error('Test validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Test validation failed',
      error: error.message
    });
  }
});

// Test database connection endpoint
router.get('/db-test', async (req, res) => {
  try {
    const { sequelize } = require('../models');
    await sequelize.authenticate();
    res.json({
      success: true,
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

module.exports = router;

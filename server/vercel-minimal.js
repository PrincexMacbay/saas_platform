// Minimal Vercel serverless function entry point for testing
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "http:"],
    },
  },
}));

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://client-seven-sage.vercel.app',
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL === '1',
    database_url_set: !!(process.env.SUPABASE_POSTGRES_URL || process.env.DATABASE_URL),
    supabase_postgres_url_set: !!process.env.SUPABASE_POSTGRES_URL,
    client_url: process.env.CLIENT_URL
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

// API routes (with error handling)
app.use('/api', (req, res, next) => {
  // For now, return a simple response to test if routes are working
  if (req.path === '/test') {
    return res.json({ message: 'API test endpoint working!' });
  }
  
  // Try to load routes, but don't crash if they fail
  try {
    const routes = require("./routes");
    return routes(req, res, next);
  } catch (error) {
    console.error('❌ Routes loading error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Routes not available',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : error.message;
    
  res.status(error.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export for Vercel
module.exports = app;

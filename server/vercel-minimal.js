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

// CORS configuration - more permissive for Vercel deployment
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:5173',
        'https://client-seven-sage.vercel.app',
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        // Allow any Vercel preview URLs
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.vercel\.app\/$/,
      ].filter(Boolean);

      // Check if origin matches any allowed origin
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
          return allowedOrigin === origin;
        } else if (allowedOrigin instanceof RegExp) {
          return allowedOrigin.test(origin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        // For Vercel deployment, be more permissive in production
        if (process.env.NODE_ENV === 'production' && process.env.VERCEL === '1') {
          console.log('Allowing origin in production Vercel environment');
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

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

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: {
      'access-control-allow-origin': req.headers.origin || '*',
      'access-control-allow-credentials': 'true'
    }
  });
});

// Simple POST test for CORS
app.post('/cors-test', (req, res) => {
  res.json({
    message: 'POST CORS is working!',
    receivedData: req.body,
    origin: req.headers.origin,
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
  console.error('❌ Error stack:', error.stack);
  console.error('❌ Request URL:', req.url);
  console.error('❌ Request method:', req.method);
  console.error('❌ Request headers:', req.headers);
  
  // Handle CORS errors specifically
  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS policy violation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : error.message;
    
  res.status(error.status || 500).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: error.stack,
      details: error 
    })
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

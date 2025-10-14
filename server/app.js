require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please set these environment variables in your Render service settings');
  console.error('The server will continue to start but registration/login will fail');
  // Don't exit in production - let the server start and fail gracefully
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
} else {
  console.log('✅ All required environment variables are set');
}

console.log('Environment:', process.env.NODE_ENV || 'development');

const routes = require("./routes");
const { sequelize } = require("./models");
const { testConnection } = require("./config/db");
const initializeAdmin = require("./scripts/init-admin");
const seederService = require("./services/seederService");

const app = express();

// Security middleware with modified CSP for images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "http:"],
    },
  },
}));

// CORS configuration - updated to include frontend URL
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Define allowed origins
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        // Render deployment URLs
        "https://social-network-frontend-k0ml.onrender.com",
        "https://social-network-backend-w91a.onrender.com",
        process.env.CLIENT_URL,
        process.env.FRONTEND_URL,
        process.env.RENDER_FRONTEND_URL,
      ].filter(Boolean); // Remove any undefined values

      // Log CORS debugging info only in development
      if (process.env.NODE_ENV === 'development') {
        console.log('CORS check - Origin:', origin);
        console.log('CORS check - Allowed origins:', allowedOrigins);
        console.log('CORS check - Environment:', process.env.NODE_ENV);
      }

      // Check if origin matches any allowed origin
      const isAllowed = allowedOrigins.includes(origin);
      
      // For Render deployment, be more permissive in production
      if (isAllowed || (process.env.NODE_ENV === 'production' && process.env.RENDER === 'true')) {
        return callback(null, true);
      } else {
        console.warn("CORS blocked origin: " + origin);
        console.warn("Allowed origins:", allowedOrigins);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files for uploads - with proper headers
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
  setHeaders: (res, filePath) => {
    // Set CORS headers for static files
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Set appropriate content type based on file extension
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// API routes
app.use("/api", routes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Sequelize validation errors
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      })),
    });
  }

  // Sequelize unique constraint errors
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.path + " already exists",
      })),
    });
  }

  // Sequelize database connection errors
  if (error.name === "SequelizeConnectionError") {
    return res.status(500).json({
      success: false,
      message: "Database connection error",
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // CORS errors
  if (error.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "CORS policy violation",
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error 
    }),
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error("Database connection failed");
    }

    // Sync database (create tables)
    if (process.env.NODE_ENV === "development") {
      await syncDatabase(false); // Don't force, just alter existing tables
      
      // Seed database with demo data (only in development)
      console.log('🌱 Seeding database with demo data...');
      await seederService.seedDatabase();
    } else {
      // In production, only sync if tables don't exist
      await sequelize.sync({ alter: false });
    }

    // Initialize admin account (runs after database sync)
    console.log('🔧 Initializing admin account...');
    await initializeAdmin();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log("🚀 Server running on port " + PORT);
      console.log("🌍 Environment: " + (process.env.NODE_ENV || "development"));
      console.log("📁 Static files served from: " + path.join(__dirname, "uploads"));
      console.log("🔗 Frontend URL: https://social-network-frontend-k0ml.onrender.com");
      console.log("🔗 Backend URL: https://social-network-backend-w91a.onrender.com");
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await sequelize.close();
  process.exit(0);
});

if (require.main === module) {
  startServer();
}

module.exports = app;

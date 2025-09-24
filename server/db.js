require('dotenv').config();
const { Sequelize } = require('sequelize');

// Database configuration
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'social_network_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Create Sequelize instance
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;

if (env === 'production' && process.env.DATABASE_URL) {
  // Parse DATABASE_URL and force IPv4 connection
  let databaseUrl = process.env.DATABASE_URL;
  
  console.log('🔗 Using DATABASE_URL for production connection');
  console.log('📍 Host: db.iptfgbgnfcipeggazsxi.supabase.co');
  console.log('🗄️  Database: postgres');
  
  // Production with DATABASE_URL - optimized for Render/Supabase
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      // Force IPv4 connection to avoid IPv6 issues on Render
      native: false,
      // Additional connection options for Render/Supabase
      connectTimeout: 60000,
      requestTimeout: 60000,
      // Force IPv4
      family: 4,
      // Additional options for better connectivity
      keepAlive: true,
      keepAliveInitialDelayMillis: 0
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      // Additional pool options for Render
      evict: 1000,
      handleDisconnects: true
    },
    // Additional options for Render deployment
    define: {
      timestamps: true,
      underscored: false
    },
    // Retry configuration
    retry: {
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ETIMEDOUT/,
        /ESOCKETTIMEDOUT/,
        /EHOSTUNREACH/,
        /EPIPE/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  });
} else {
  // Development or other environments
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      dialectOptions: dbConfig.dialectOptions
    }
  );
}

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

// Sync database (create tables if they don't exist)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to sync database:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};



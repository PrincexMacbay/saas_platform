require('dotenv').config();

const { Sequelize } = require('sequelize');

// Database configuration
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Macbayprince05@',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'db.iptfgbgnfcipeggazsxi.supabase.co',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Macbayprince05@',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'db.iptfgbgnfcipeggazsxi.supabase.co',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Disable logging in production
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};

// Parse DATABASE_URL if provided (Render/Supabase style)
if (process.env.DATABASE_URL) {
  // Fix common issue where DATABASE_URL includes the variable name
  let databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl.startsWith('DATABASE_URL=')) {
    databaseUrl = databaseUrl.substring('DATABASE_URL='.length);
    console.log('🔧 Fixed DATABASE_URL format (removed variable name prefix)');
  }
  
  const url = new URL(databaseUrl);
  const env = process.env.NODE_ENV || 'development';
  
  config[env] = {
    ...config[env],
    username: url.username,
    password: decodeURIComponent(url.password), // Decode URL-encoded password
    database: url.pathname.substring(1), // Remove leading slash
    host: url.hostname,
    port: url.port,
    dialect: 'postgres',
    logging: env === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  };
  
  console.log(`✅ Database configured from DATABASE_URL for ${env} environment`);
  console.log(`📍 Host: ${config[env].host}`);
  console.log(`🗄️  Database: ${config[env].database}`);
} else {
  console.log('⚠️  DATABASE_URL not found, using individual environment variables');
}

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  dialectOptions: dbConfig.dialectOptions,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

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

module.exports = {
  sequelize,
  testConnection,
  config: dbConfig
};


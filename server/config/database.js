const { Sequelize } = require('sequelize');
require('dotenv').config();

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'NULL/EMPTY');
console.log('DATABASE_POSTGRES_URL exists:', !!process.env.DATABASE_POSTGRES_URL);
console.log('DATABASE_POSTGRES_URL length:', process.env.DATABASE_POSTGRES_URL ? process.env.DATABASE_POSTGRES_URL.length : 0);
console.log('DB_DIALECT:', process.env.DB_DIALECT);

let sequelize;

// Check if using SQLite for development
if (process.env.DB_DIALECT === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './database.sqlite',
    logging: false, // Disable SQL logging
  });
  if (process.env.NODE_ENV === 'development') {
    console.log('Using SQLite database for development');
  }
} else {
  // PostgreSQL configuration
  const config = {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD || ''), // Explicitly convert to string
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false, // Disable SQL logging
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // SSL configuration for production
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
  };

  // Use DATABASE_URL if available, otherwise use individual environment variables
  const databaseUrl = process.env.DATABASE_URL;
  
  console.log('DATABASE_URL check:', {
    exists: !!databaseUrl,
    length: databaseUrl ? databaseUrl.length : 0,
    isEmpty: databaseUrl ? databaseUrl.trim() === '' : true,
    startsWith: databaseUrl ? databaseUrl.substring(0, 10) : 'N/A'
  });
  
  if (databaseUrl && databaseUrl.trim() !== '' && databaseUrl.length > 10) {
    console.log('Using Supabase DATABASE_URL for connection');
    try {
      sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: config.logging,
        pool: config.pool,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
      });
    } catch (error) {
      console.error('Error creating Sequelize with DATABASE_URL:', error.message);
      throw error;
    }
  } else {
    console.log('DATABASE_URL not valid, using individual environment variables');
    console.log('Individual config:', {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password ? 'SET' : 'NOT SET'
    });
    sequelize = new Sequelize(config);
  }
}

module.exports = sequelize;
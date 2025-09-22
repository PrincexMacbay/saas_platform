const { Sequelize } = require('sequelize');
require('dotenv').config();

// Debug environment variables
console.log('Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'SET' : 'NULL/EMPTY');
console.log('DATABASE_POSTGRES_URL exists:', !!process.env.DATABASE_POSTGRES_URL);
console.log('DATABASE_POSTGRES_URL value:', process.env.DATABASE_POSTGRES_URL ? 'SET' : 'NULL/EMPTY');
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
  
  if (databaseUrl && databaseUrl.trim() !== '') {
    console.log('Using Supabase DATABASE_URL for connection');
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
  } else {
    console.log('DATABASE_URL not found, using individual environment variables');
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
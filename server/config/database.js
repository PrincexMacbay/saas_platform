const { Sequelize } = require('sequelize');
require('dotenv').config();

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
  sequelize = process.env.DATABASE_URL 
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: config.logging,
        pool: config.pool,
        dialectOptions: config.dialectOptions,
      })
    : new Sequelize(config);
}

module.exports = sequelize;
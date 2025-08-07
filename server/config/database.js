const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration with explicit type conversion
const config = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASSWORD || ''), // Explicitly convert to string
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Use DATABASE_URL if available, otherwise use individual environment variables
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: config.logging,
      pool: config.pool,
    })
  : new Sequelize(config);

module.exports = sequelize;
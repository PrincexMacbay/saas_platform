const { Sequelize } = require('sequelize');
require('dotenv').config();

// Vercel-optimized database configuration
let sequelize;

// Check if we're in Vercel environment
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

console.log('Database Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL);
console.log('- Is Vercel:', isVercel);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);

try {
  if (process.env.DB_DIALECT === 'sqlite') {
    // SQLite for development
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: process.env.DB_STORAGE || './database.sqlite',
      logging: false,
    });
    console.log('✅ Using SQLite database');
  } else {
    // PostgreSQL configuration
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required for PostgreSQL');
    }

    console.log('✅ Using PostgreSQL database with DATABASE_URL');

    // Vercel-optimized Sequelize configuration
    sequelize = new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: false, // Disable SQL logging in production
      pool: {
        max: isVercel ? 5 : 10, // Reduce pool size for serverless
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        // Vercel-specific optimizations
        ...(isVercel && {
          connectionTimeoutMillis: 10000,
          idleTimeoutMillis: 30000,
        })
      },
      // Vercel-specific settings
      ...(isVercel && {
        retry: {
          max: 3,
          timeout: 10000,
        },
        benchmark: false,
        define: {
          timestamps: true,
          underscored: false,
          freezeTableName: true,
        }
      })
    });

    // Test connection
    sequelize.authenticate()
      .then(() => {
        console.log('✅ Database connection established successfully');
      })
      .catch((error) => {
        console.error('❌ Unable to connect to the database:', error.message);
        throw error;
      });
  }
} catch (error) {
  console.error('❌ Database configuration error:', error.message);
  throw error;
}

module.exports = sequelize;

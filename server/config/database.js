const { Sequelize } = require('sequelize');
require('dotenv').config();

// Debug environment variables
console.log('🔍 Database Environment Check:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL:', process.env.VERCEL);
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- SUPABASE_POSTGRES_URL exists:', !!process.env.SUPABASE_POSTGRES_URL);
console.log('- SUPABASE_POSTGRES_URL_NON_POOLING exists:', !!process.env.SUPABASE_POSTGRES_URL_NON_POOLING);
console.log('- DB_DIALECT:', process.env.DB_DIALECT);

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

  // Use Supabase environment variables in order of preference
  const databaseUrl = process.env.SUPABASE_POSTGRES_URL || 
                     process.env.SUPABASE_POSTGRES_URL_NON_POOLING || 
                     process.env.DATABASE_URL;
  
  console.log('DATABASE_URL check:', {
    exists: !!databaseUrl,
    length: databaseUrl ? databaseUrl.length : 0,
    isEmpty: databaseUrl ? databaseUrl.trim() === '' : true,
    startsWith: databaseUrl ? databaseUrl.substring(0, 10) : 'N/A'
  });
  
  if (databaseUrl && databaseUrl.trim() !== '' && databaseUrl.length > 10) {
    console.log('✅ Using Supabase PostgreSQL connection');
    console.log('Using URL type:', process.env.SUPABASE_POSTGRES_URL ? 'SUPABASE_POSTGRES_URL' : 
                                  process.env.SUPABASE_POSTGRES_URL_NON_POOLING ? 'SUPABASE_POSTGRES_URL_NON_POOLING' : 
                                  'DATABASE_URL');
    try {
      // Check if we're in Vercel environment
      const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
      
      sequelize = new Sequelize(databaseUrl, {
        dialect: 'postgres',
        logging: config.logging,
        pool: {
          max: isVercel ? 5 : config.pool.max, // Reduce pool size for serverless
          min: config.pool.min,
          acquire: config.pool.acquire,
          idle: config.pool.idle,
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
    } catch (error) {
      console.error('❌ Error creating Sequelize with DATABASE_URL:', error.message);
      throw error;
    }
  } else {
    console.log('⚠️ DATABASE_URL not valid, using individual environment variables');
    console.log('Individual config:', {
      host: config.host,
      port: config.port,
      database: config.database,
      username: config.username,
      password: config.password ? 'SET' : 'NOT SET'
    });
    try {
      sequelize = new Sequelize(config);
    } catch (error) {
      console.error('❌ Error creating Sequelize with individual config:', error.message);
      throw error;
    }
  }
}

module.exports = sequelize;
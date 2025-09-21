const { Client } = require('pg');
require('dotenv').config();

const testRenderConnection = async () => {
  let client;
  
  try {
    console.log('🔍 Testing Render database connection...');
    
    // Connect using DATABASE_URL or individual parameters
    const connectionConfig = process.env.DATABASE_URL 
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: { rejectUnauthorized: false }
        };

    console.log('📡 Connection config:', {
      host: connectionConfig.host || 'from DATABASE_URL',
      port: connectionConfig.port || 'from DATABASE_URL',
      database: connectionConfig.database || 'from DATABASE_URL',
      user: connectionConfig.user || 'from DATABASE_URL',
      ssl: connectionConfig.ssl ? 'enabled' : 'disabled'
    });

    client = new Client(connectionConfig);
    await client.connect();
    console.log('✅ Successfully connected to Render database!');

    // Test basic query
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('🕐 Current time:', result.rows[0].current_time);
    console.log('🐘 PostgreSQL version:', result.rows[0].postgres_version.split(' ')[0]);

    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    if (tablesResult.rows.length > 0) {
      console.log('\n📊 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️  No tables found. You may need to run the database setup script.');
    }

    // Test if users table exists and has data
    try {
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Users in database: ${usersResult.rows[0].count}`);
    } catch (error) {
      console.log('⚠️  Users table does not exist yet');
    }

    console.log('\n🎉 Database connection test completed successfully!');
    console.log('Your Render database is ready to use.');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 This usually means the hostname is incorrect.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 This usually means the port is incorrect or the database is not accessible.');
    } else if (error.message.includes('password authentication failed')) {
      console.error('💡 This usually means the username or password is incorrect.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('💡 This usually means the database name is incorrect.');
    }
    
    console.error('\n🔧 Troubleshooting tips:');
    console.error('1. Check your DATABASE_URL or individual database environment variables');
    console.error('2. Make sure your Render database is running and accessible');
    console.error('3. Verify the connection details in your Render dashboard');
    
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the test if this script is executed directly
if (require.main === module) {
  console.log('🚀 Starting Render database connection test...');
  testRenderConnection();
}

module.exports = testRenderConnection;

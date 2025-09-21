const { Client } = require('pg');
require('dotenv').config();

const setupRenderDatabase = async () => {
  let client;
  
  try {
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

    client = new Client(connectionConfig);
    await client.connect();
    console.log('✅ Connected to Render database successfully');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID extension enabled');

    // Read and execute the database setup script
    const fs = require('fs');
    const path = require('path');
    
    const setupScript = fs.readFileSync(
      path.join(__dirname, '..', 'setup-database-simple.sql'), 
      'utf8'
    );

    // Split the script into individual statements and execute them
    const statements = setupScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          // Some statements might fail if tables already exist, which is okay
          if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
            throw error;
          }
        }
      }
    }

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📊 Tables created:');
    result.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Check if admin user exists
    const adminCheck = await client.query('SELECT COUNT(*) as count FROM users WHERE username = $1', ['admin']);
    console.log(`\n👤 Admin user exists: ${adminCheck.rows[0].count > 0 ? 'Yes' : 'No'}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now deploy your application to Render.');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
      console.log('🔌 Database connection closed');
    }
  }
};

// Run the setup if this script is executed directly
if (require.main === module) {
  console.log('🚀 Starting Render database setup...');
  console.log('Make sure you have set your DATABASE_URL or database environment variables.');
  setupRenderDatabase();
}

module.exports = setupRenderDatabase;

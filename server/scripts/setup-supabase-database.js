const { Client } = require('pg');

const setupSupabaseDatabase = async () => {
  let client;
  
  try {
    // Get the Supabase connection string from command line argument
    const databaseUrl = process.argv[2];
    
    if (!databaseUrl) {
      console.error('❌ Please provide the Supabase connection string as an argument');
      console.log('Usage: node setup-supabase-database.js "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"');
      process.exit(1);
    }

    console.log('🚀 Starting Supabase database setup...');
    console.log('🔗 Connecting to Supabase...');

    // Connect to Supabase
    const connectionConfig = { 
      connectionString: databaseUrl, 
      ssl: { rejectUnauthorized: false } 
    };

    client = new Client(connectionConfig);
    await client.connect();
    console.log('✅ Connected to Supabase database successfully');

    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    console.log('✅ UUID extension enabled');

    // Read and execute the database setup script
    const fs = require('fs');
    const path = require('path');
    const setupScriptPath = path.join(__dirname, '..', 'setup-database.sql');
    
    if (!fs.existsSync(setupScriptPath)) {
      throw new Error(`Setup script not found at: ${setupScriptPath}`);
    }

    const setupScript = fs.readFileSync(setupScriptPath, 'utf8');
    
    // Split the script into individual statements
    const statements = setupScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        // Continue with other statements
      }
    }

    // Check what tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('\n📊 Tables created:');
    tables.forEach(table => console.log(`  - ${table}`));

    // Check if admin user exists
    const adminResult = await client.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['admin']);
    const adminCount = parseInt(adminResult.rows[0].count);
    console.log(`\n👤 Admin user exists: ${adminCount > 0 ? 'Yes' : 'No'}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now use your Supabase database with your application.');

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

setupSupabaseDatabase();

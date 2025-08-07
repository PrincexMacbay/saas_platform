const { Client } = require('pg');
require('dotenv').config();

const createDatabase = async () => {
  // Connect to PostgreSQL without specifying a database
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if database exists
    const checkResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [process.env.DB_NAME]
    );

    if (checkResult.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
      console.log(`Database "${process.env.DB_NAME}" created successfully`);
    } else {
      console.log(`Database "${process.env.DB_NAME}" already exists`);
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

if (require.main === module) {
  createDatabase();
}

module.exports = createDatabase;
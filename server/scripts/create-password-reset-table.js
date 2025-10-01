#!/usr/bin/env node

/**
 * Database Migration Script: Create Password Reset Tokens Table
 * 
 * This script creates the password_reset_tokens table in the database.
 * Run this script after deploying the updated backend code.
 * 
 * Usage:
 *   node scripts/create-password-reset-table.js
 * 
 * Or via npm script:
 *   npm run db:migrate-password-reset
 */

require('dotenv').config();
const { sequelize, PasswordResetToken } = require('../models');

async function createPasswordResetTable() {
  try {
    console.log('🔄 Starting password reset tokens table migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Create the password_reset_tokens table
    await PasswordResetToken.sync({ force: false });
    console.log('✅ Password reset tokens table created/verified successfully');
    
    // Check if table exists and show structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'password_reset_tokens' 
      ORDER BY ordinal_position;
    `);
    
    if (results.length > 0) {
      console.log('📋 Table structure:');
      console.table(results.map(col => ({
        Column: col.column_name,
        Type: col.data_type,
        Nullable: col.is_nullable,
        Default: col.column_default || 'None'
      })));
    }
    
    // Create indexes if they don't exist
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id 
        ON password_reset_tokens(user_id);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at 
        ON password_reset_tokens(expires_at);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used 
        ON password_reset_tokens(used);
      `);
      
      console.log('✅ Database indexes created/verified successfully');
    } catch (indexError) {
      console.log('⚠️ Index creation warning:', indexError.message);
    }
    
    console.log('🎉 Password reset tokens table migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the migration
if (require.main === module) {
  createPasswordResetTable();
}

module.exports = createPasswordResetTable;

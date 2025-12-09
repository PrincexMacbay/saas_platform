#!/usr/bin/env node

/**
 * Database Migration Script: Email Verification System
 * 
 * This script:
 * 1. Adds emailVerified and emailVerifiedAt columns to users table
 * 2. Creates the email_verification_tokens table
 * 
 * Run this script after deploying the updated backend code.
 * 
 * Usage:
 *   node scripts/create-email-verification-tables.js
 * 
 * Or via npm script:
 *   npm run db:migrate-email-verification
 */

require('dotenv').config();
const { sequelize, EmailVerificationToken, User } = require('../models');
const { DataTypes } = require('sequelize');

async function createEmailVerificationTables() {
  try {
    console.log('🔄 Starting email verification system migration...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Step 1: Add emailVerified and emailVerifiedAt columns to users table
    console.log('\n📝 Step 1: Adding email verification columns to users table...');
    
    try {
      // Check if emailVerified column exists
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'emailVerified';
      `);
      
      if (columns.length === 0) {
        // Add emailVerified column
        await sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN "emailVerified" BOOLEAN DEFAULT false;
        `);
        console.log('✅ Added emailVerified column to users table');
      } else {
        console.log('ℹ️  emailVerified column already exists');
      }
    } catch (error) {
      if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
        console.log('ℹ️  emailVerified column already exists');
      } else {
        throw error;
      }
    }
    
    try {
      // Check if emailVerifiedAt column exists
      const [columns] = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'emailVerifiedAt';
      `);
      
      if (columns.length === 0) {
        // Add emailVerifiedAt column
        await sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN "emailVerifiedAt" TIMESTAMP NULL;
        `);
        console.log('✅ Added emailVerifiedAt column to users table');
      } else {
        console.log('ℹ️  emailVerifiedAt column already exists');
      }
    } catch (error) {
      if (error.message.includes('duplicate column') || error.message.includes('already exists')) {
        console.log('ℹ️  emailVerifiedAt column already exists');
      } else {
        throw error;
      }
    }
    
    // Step 2: Create the email_verification_tokens table
    console.log('\n📝 Step 2: Creating email_verification_tokens table...');
    
    await EmailVerificationToken.sync({ force: false });
    console.log('✅ Email verification tokens table created/verified successfully');
    
    // Check if table exists and show structure
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'email_verification_tokens' 
      ORDER BY ordinal_position;
    `);
    
    if (results.length > 0) {
      console.log('📋 email_verification_tokens table structure:');
      console.table(results.map(col => ({
        Column: col.column_name,
        Type: col.data_type,
        Nullable: col.is_nullable,
        Default: col.column_default || 'None'
      })));
    }
    
    // Step 3: Create indexes if they don't exist
    console.log('\n📝 Step 3: Creating database indexes...');
    
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id 
        ON email_verification_tokens(user_id);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at 
        ON email_verification_tokens(expires_at);
      `);
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_used 
        ON email_verification_tokens(used);
      `);
      
      console.log('✅ Database indexes created/verified successfully');
    } catch (indexError) {
      console.log('⚠️  Index creation warning:', indexError.message);
    }
    
    // Step 4: Verify users table structure
    console.log('\n📝 Step 4: Verifying users table structure...');
    const [userColumns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('emailVerified', 'emailVerifiedAt')
      ORDER BY ordinal_position;
    `);
    
    if (userColumns.length > 0) {
      console.log('📋 Email verification columns in users table:');
      console.table(userColumns.map(col => ({
        Column: col.column_name,
        Type: col.data_type,
        Nullable: col.is_nullable,
        Default: col.column_default || 'None'
      })));
    }
    
    // Step 5: Set default values for existing users (optional - set all to false)
    console.log('\n📝 Step 5: Setting default values for existing users...');
    try {
      const [updateResult] = await sequelize.query(`
        UPDATE users 
        SET "emailVerified" = false 
        WHERE "emailVerified" IS NULL;
      `);
      console.log(`✅ Updated ${updateResult} existing users with emailVerified = false`);
    } catch (error) {
      console.log('⚠️  Could not update existing users:', error.message);
    }
    
    console.log('\n🎉 Email verification system migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ emailVerified column added to users table');
    console.log('  ✅ emailVerifiedAt column added to users table');
    console.log('  ✅ email_verification_tokens table created');
    console.log('  ✅ Database indexes created');
    console.log('\n💡 Next steps:');
    console.log('  1. Test email verification by registering a new user');
    console.log('  2. Check that verification emails are being sent');
    
    return true; // Success
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    if (error.stack && process.env.NODE_ENV === 'development') {
      console.error('Stack trace:', error.stack);
    }
    // Don't exit in production - let the server continue
    if (process.env.NODE_ENV === 'development' && require.main === module) {
      process.exit(1);
    }
    throw error; // Re-throw so caller can handle
  } finally {
    // Only close connection if we're running as standalone script
    if (require.main === module) {
      await sequelize.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the migration
if (require.main === module) {
  createEmailVerificationTables().finally(() => {
    sequelize.close();
    console.log('\n🔌 Database connection closed');
  });
}

module.exports = createEmailVerificationTables;


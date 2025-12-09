#!/usr/bin/env node

/**
 * Script to verify existing users (especially admin accounts)
 * 
 * This script sets emailVerified = true for existing users so they can log in.
 * Useful after implementing email verification on an existing system.
 * 
 * Usage:
 *   node scripts/verify-existing-users.js
 * 
 * Or via npm script:
 *   npm run db:verify-existing-users
 */

require('dotenv').config();
const { sequelize, User } = require('../models');

async function verifyExistingUsers() {
  try {
    console.log('🔄 Starting user verification process...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Get all unverified users
    const unverifiedUsers = await User.findAll({
      where: {
        emailVerified: false
      }
    });
    
    console.log(`\n📊 Found ${unverifiedUsers.length} unverified users`);
    
    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are already verified!');
      return;
    }
    
    // Separate admins from regular users
    const admins = unverifiedUsers.filter(u => u.role === 'admin');
    const regularUsers = unverifiedUsers.filter(u => u.role !== 'admin');
    
    console.log(`  - ${admins.length} admin users`);
    console.log(`  - ${regularUsers.length} regular users`);
    
    // Verify all users
    let verifiedCount = 0;
    
    for (const user of unverifiedUsers) {
      await user.update({
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      verifiedCount++;
      console.log(`  ✅ Verified: ${user.username} (${user.email}) - Role: ${user.role || 'user'}`);
    }
    
    console.log(`\n🎉 Successfully verified ${verifiedCount} users!`);
    console.log('\n📋 Summary:');
    console.log(`  ✅ ${admins.length} admin accounts verified`);
    console.log(`  ✅ ${regularUsers.length} regular user accounts verified`);
    console.log('\n💡 All verified users can now log in without email verification.');
    console.log('   New users will still need to verify their email during registration.');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  verifyExistingUsers();
}

module.exports = verifyExistingUsers;


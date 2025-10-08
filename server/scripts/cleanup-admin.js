/**
 * Script to cleanup old admin accounts
 * Run this with: node server/scripts/cleanup-admin.js
 */

require('dotenv').config();
const { User, UserProfile } = require('../models');
const { sequelize } = require('../models');

const cleanupOldAdmin = async () => {
  try {
    console.log('🔧 Starting admin cleanup...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find all admin accounts
    const admins = await User.findAll({
      where: { 
        role: 'admin'
      }
    });

    console.log(`\n📋 Found ${admins.length} admin account(s):`);
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. Admin Details:`);
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Name: ${admin.firstName} ${admin.lastName}`);
      console.log(`   Created: ${admin.createdAt}`);
    });

    // Get target admin email from environment
    const TARGET_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';
    
    console.log(`\n🎯 Target admin email from environment: ${TARGET_ADMIN_EMAIL}`);
    
    // Find admins that DON'T match the target email
    const oldAdmins = admins.filter(admin => admin.email !== TARGET_ADMIN_EMAIL);
    
    if (oldAdmins.length === 0) {
      console.log('\n✅ No old admin accounts to delete. Current admin matches environment variable!');
      process.exit(0);
    }

    console.log(`\n🗑️  Will delete ${oldAdmins.length} old admin account(s):`);
    
    for (const admin of oldAdmins) {
      console.log(`\n   Deleting: ${admin.email} (${admin.username})`);
      
      // Delete user profile first (foreign key constraint)
      await UserProfile.destroy({
        where: { userId: admin.id }
      });
      console.log('   ✅ Profile deleted');
      
      // Delete user
      await admin.destroy();
      console.log('   ✅ User deleted');
    }

    console.log('\n✅ ============================================');
    console.log('✅ Old admin accounts deleted successfully!');
    console.log('✅ ============================================');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your server');
    console.log('   2. The init-admin script will create a new admin with your environment variables');
    console.log(`   3. Login with: ${TARGET_ADMIN_EMAIL}`);
    
    await sequelize.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    console.error('❌ Stack trace:', error.stack);
    process.exit(1);
  }
};

cleanupOldAdmin();

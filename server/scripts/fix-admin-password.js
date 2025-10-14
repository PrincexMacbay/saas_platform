const bcrypt = require('bcryptjs');
const { User } = require('../models');
require('dotenv').config();

/**
 * Fix Admin Password Script
 * This script will reset the admin password to match the environment variables
 */
async function fixAdminPassword() {
  try {
    console.log('🔧 Fixing Admin Password...');
    
    // Get admin credentials from environment variables
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

    console.log('📧 Admin Email:', ADMIN_EMAIL);
    console.log('👤 Admin Username:', ADMIN_USERNAME);
    console.log('🔑 New Password:', ADMIN_PASSWORD);

    // Find admin user
    const admin = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email: ADMIN_EMAIL },
          { username: ADMIN_USERNAME }
        ]
      }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Username:', admin.username);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    
    // Update the password
    await admin.update({ password: hashedPassword });
    
    console.log('✅ Admin password updated successfully!');
    console.log('🔑 New password:', ADMIN_PASSWORD);
    
    // Verify the password works
    const isValid = await admin.validatePassword(ADMIN_PASSWORD);
    console.log('✅ Password verification test:', isValid ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  }
}

// Run if called directly
if (require.main === module) {
  fixAdminPassword()
    .then(() => {
      console.log('🎉 Admin password fix completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin password fix failed:', error);
      process.exit(1);
    });
}

module.exports = fixAdminPassword;

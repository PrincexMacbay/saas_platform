const { User } = require('../models');
require('dotenv').config();

/**
 * Test Admin Login Script
 * Tests if the admin login works with current credentials
 */
async function testAdminLogin() {
  try {
    console.log('🔍 Testing Admin Login...');
    
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

    console.log('📧 Testing with email:', ADMIN_EMAIL);
    console.log('👤 Testing with username:', ADMIN_USERNAME);
    console.log('🔑 Password:', ADMIN_PASSWORD);

    // Test with email
    const userByEmail = await User.findOne({
      where: { email: ADMIN_EMAIL }
    });

    if (userByEmail) {
      console.log('✅ User found by email');
      const isValidPassword = await userByEmail.validatePassword(ADMIN_PASSWORD);
      console.log('🔑 Password validation:', isValidPassword ? '✅ VALID' : '❌ INVALID');
    } else {
      console.log('❌ User not found by email');
    }

    // Test with username
    const userByUsername = await User.findOne({
      where: { username: ADMIN_USERNAME }
    });

    if (userByUsername) {
      console.log('✅ User found by username');
      const isValidPassword = await userByUsername.validatePassword(ADMIN_PASSWORD);
      console.log('🔑 Password validation:', isValidPassword ? '✅ VALID' : '❌ INVALID');
    } else {
      console.log('❌ User not found by username');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testAdminLogin()
    .then(() => {
      console.log('🎉 Admin login test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Admin login test failed:', error);
      process.exit(1);
    });
}

module.exports = testAdminLogin;

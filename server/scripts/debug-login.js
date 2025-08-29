require('dotenv').config();
const { User, UserProfile } = require('../models');

async function debugLogin() {
  try {
    console.log('🔍 DEBUGGING LOGIN ISSUE\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    // Check database connection
    console.log('\n🔗 Database Connection:');
    try {
      await require('../config/database').authenticate();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }
    
    // Get all users
    console.log('\n👥 All Users in Database:');
    const users = await User.findAll({
      include: [
        {
          model: UserProfile,
          as: 'profile'
        }
      ],
      attributes: ['id', 'username', 'email', 'status', 'createdAt']
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n💡 SOLUTION: You need to register a user first');
      return;
    }
    
    console.log(`✅ Found ${users.length} user(s):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user.id}`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Email: ${user.email}`);
      console.log(`      Status: ${user.status} (1=enabled, 0=disabled)`);
      console.log(`      Profile Type: ${user.profile?.userType || 'none'}`);
      console.log(`      Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Test password validation for first user
    if (users.length > 0) {
      console.log('🔐 Testing Password Validation:');
      const testUser = users[0];
      
      // Try to get the full user with password
      const fullUser = await User.findByPk(testUser.id);
      console.log(`Testing user: ${fullUser.username}`);
      console.log(`Password hash exists: ${!!fullUser.password}`);
      console.log(`Password hash length: ${fullUser.password?.length || 0}`);
      
      // Test with common passwords
      const testPasswords = ['password', '123456', 'admin', 'test'];
      for (const testPassword of testPasswords) {
        try {
          const isValid = await fullUser.validatePassword(testPassword);
          console.log(`Password "${testPassword}": ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        } catch (error) {
          console.log(`Password "${testPassword}": ❌ Error - ${error.message}`);
        }
      }
    }
    
    console.log('\n📋 LOGIN TROUBLESHOOTING:');
    console.log('1. Make sure you have a .env file in the server directory');
    console.log('2. Ensure JWT_SECRET is set in your .env file');
    console.log('3. Check that the user status is 1 (enabled)');
    console.log('4. Verify the password you\'re using matches what was set during registration');
    console.log('5. Try registering a new user to test the login flow');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugLogin();

require('dotenv').config();
const { User, UserProfile } = require('../models');

async function createTestUser() {
  try {
    console.log('🔧 Creating Test User\n');
    
    // Test user credentials
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        username: testUser.username
      }
    });
    
    if (existingUser) {
      console.log('⚠️  Test user already exists');
      console.log('Username: testuser');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      console.log('\nYou can use these credentials to login');
      return;
    }
    
    // Create new test user
    const user = await User.create({
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      status: 1
    });
    
    // Create user profile
    await UserProfile.create({
      userId: user.id,
      userType: 'individual'
    });
    
    console.log('✅ Test user created successfully!');
    console.log('Username: testuser');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\nYou can now use these credentials to login');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

createTestUser();


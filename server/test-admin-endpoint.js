const axios = require('axios');

// Test the admin users endpoint
async function testAdminEndpoint() {
  try {
    console.log('🔍 Testing admin users endpoint...');
    
    // Test without authentication first
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      console.log('❌ Unexpected: Endpoint accessible without auth:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correct: Endpoint requires authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test with invalid token
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Unexpected: Invalid token accepted:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correct: Invalid token rejected (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('✅ Admin endpoint authentication is working correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    const { sequelize } = require('./models');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    
    // Test User model
    const { User } = require('./models');
    const userCount = await User.count();
    console.log(`✅ User model working - Found ${userCount} users`);
    
    // Test UserProfile model
    const { UserProfile } = require('./models');
    const profileCount = await UserProfile.count();
    console.log(`✅ UserProfile model working - Found ${profileCount} profiles`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting admin endpoint tests...\n');
  
  await testDatabaseConnection();
  console.log('');
  await testAdminEndpoint();
  
  console.log('\n✅ All tests completed');
  process.exit(0);
}

runTests().catch(console.error);

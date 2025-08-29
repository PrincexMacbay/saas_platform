const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testSignupFlow() {
  try {
    console.log('🧪 Testing Signup and Role Selection Flow...\n');

    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      username: 'testuser123',
      email: 'testuser123@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('   User ID:', registerResponse.data.data.user.id);
    console.log('   User Type:', registerResponse.data.data.user.profile?.userType);
    console.log('   Token received:', !!registerResponse.data.data.token);

    const token = registerResponse.data.data.token;
    const userId = registerResponse.data.data.user.id;

    // Test 2: Test role selection (individual)
    console.log('\n2. Testing role selection as individual...');
    const individualData = {
      userType: 'individual',
      workExperience: '5 years in software development',
      jobPreferences: 'Looking for remote opportunities in React/Node.js'
    };

    const individualResponse = await axios.put(`${BASE_URL}/career/user-type`, individualData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Individual role selection successful');
    console.log('   Updated User Type:', individualResponse.data.data.user.profile?.userType);
    console.log('   Individual Profile Created:', !!individualResponse.data.data.user.individualProfile);

    // Test 3: Test role selection (company)
    console.log('\n3. Testing role selection as company...');
    const companyData = {
      userType: 'company',
      companyName: 'TechCorp Inc',
      industry: 'Technology',
      companySize: '50-100',
      website: 'https://techcorp.com',
      location: 'San Francisco, CA'
    };

    const companyResponse = await axios.put(`${BASE_URL}/career/user-type`, companyData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Company role selection successful');
    console.log('   Updated User Type:', companyResponse.data.data.user.profile?.userType);
    console.log('   Company Profile Created:', !!companyResponse.data.data.user.companyProfile);

    // Test 4: Get user profile
    console.log('\n4. Testing get profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get profile successful');
    console.log('   User Type:', profileResponse.data.data.user.profile?.userType);
    console.log('   Has Individual Profile:', !!profileResponse.data.data.user.individualProfile);
    console.log('   Has Company Profile:', !!profileResponse.data.data.user.companyProfile);

    console.log('\n🎉 All tests passed! The signup and role selection flow is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testSignupFlow()
    .then(() => {
      console.log('\nTest completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testSignupFlow;

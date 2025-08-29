const axios = require('axios');

const testUserEndpoint = async (username) => {
  try {
    console.log(`\n🔍 Testing user endpoint for: ${username}`);
    
    const response = await axios.get(`http://localhost:5000/api/users/${username}`);
    
    console.log('✅ Success!');
    console.log('Response status:', response.status);
    console.log('User data:', {
      id: response.data.data.user.id,
      username: response.data.data.user.username,
      firstName: response.data.data.user.firstName,
      lastName: response.data.data.user.lastName,
      hasProfile: !!response.data.data.user.profile,
      hasIndividualProfile: !!response.data.data.user.individualProfile,
      hasCompanyProfile: !!response.data.data.user.companyProfile
    });
    
    return true;
  } catch (error) {
    console.log('❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.message);
    return false;
  }
};

const runTests = async () => {
  console.log('🧪 Testing User Endpoints');
  console.log('========================');
  
  const testUsers = ['Victor', 'Queen', 'admin', 'johnhub'];
  
  for (const username of testUsers) {
    await testUserEndpoint(username);
  }
  
  console.log('\n🎉 Test completed!');
};

runTests();

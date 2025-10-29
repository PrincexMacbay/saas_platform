const axios = require('axios');

async function testPrinceAdmin() {
  try {
    console.log('🔍 Testing Prince Admin access...');
    
    // Login with Prince admin user
    const loginResponse = await axios.post('https://social-network-backend-w91a.onrender.com/api/auth/login', {
      login: '20234417@std.neu.edu.tr',
      password: 'Macbayprince05'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('User details:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
    
    // Test admin users endpoint
    const adminResponse = await axios.get('https://social-network-backend-w91a.onrender.com/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin endpoint working!');
    console.log(`Found ${adminResponse.data.data.users.length} users`);
    console.log('First user:', adminResponse.data.data.users[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPrinceAdmin();

const axios = require('axios');

async function testAdminAccess() {
  try {
    console.log('🔍 Testing admin access...');
    
    // Login with existing user
    const loginResponse = await axios.post('https://social-network-backend-w91a.onrender.com/api/auth/login', {
      login: 'admin@example.com',
      password: 'admin123'
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
    
    // Try to access admin endpoint
    try {
      const adminResponse = await axios.get('https://social-network-backend-w91a.onrender.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Admin endpoint working!');
      console.log(`Found ${adminResponse.data.data.users.length} users`);
      
    } catch (adminError) {
      console.log('❌ Admin endpoint failed:', adminError.response?.status, adminError.response?.data);
      
      // Try to update user role via profile update
      try {
        const updateResponse = await axios.put('https://social-network-backend-w91a.onrender.com/api/users/profile', {
          role: 'admin'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Profile updated:', updateResponse.data);
        
      } catch (updateError) {
        console.log('❌ Profile update failed:', updateError.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAdminAccess();

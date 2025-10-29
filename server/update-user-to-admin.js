const axios = require('axios');

async function updateUserToAdmin() {
  try {
    console.log('🔍 Updating user to admin role...');
    
    // First, login to get a token
    const loginResponse = await axios.post('https://social-network-backend-w91a.onrender.com/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    
    // Update user role to admin
    const updateResponse = await axios.put('https://social-network-backend-w91a.onrender.com/api/users/profile', {
      role: 'admin'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User updated to admin role');
    console.log('Response:', updateResponse.data);
    
    // Test admin endpoint
    const adminResponse = await axios.get('https://social-network-backend-w91a.onrender.com/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin endpoint working!');
    console.log('Users found:', adminResponse.data.data.users.length);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

updateUserToAdmin();

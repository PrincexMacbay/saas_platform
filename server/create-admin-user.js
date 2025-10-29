const axios = require('axios');

async function createAdminUser() {
  try {
    console.log('🔍 Creating admin user...');
    
    // Create user with admin role directly
    const response = await axios.post('https://social-network-backend-w91a.onrender.com/api/auth/register', {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin' // Try to set role during registration
    });
    
    console.log('✅ User created:', response.data);
    
    // Test login
    const loginResponse = await axios.post('https://social-network-backend-w91a.onrender.com/api/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.data.token;
    
    // Test admin endpoint
    const adminResponse = await axios.get('https://social-network-backend-w91a.onrender.com/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin endpoint working!');
    console.log(`Found ${adminResponse.data.data.users.length} users`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createAdminUser();

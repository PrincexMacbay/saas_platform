const axios = require('axios');

const testRegistration = async () => {
  try {
    console.log('Testing registration endpoint...');
    
    const testData = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    console.log('Sending data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Success! Response:', response.data);
  } catch (error) {
    console.error('Error details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    console.error('Request Config:', {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.config?.data
    });
  }
};

testRegistration();

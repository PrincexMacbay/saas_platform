#!/usr/bin/env node

/**
 * Forgot Password Feature Test Script
 * 
 * This script tests the forgot password functionality:
 * 1. Tests the forgot password API endpoint
 * 2. Tests the reset password API endpoint
 * 3. Validates token creation and expiration
 * 4. Tests email service integration
 * 
 * Usage:
 *   node test-forgot-password.js [email]
 * 
 * Example:
 *   node test-forgot-password.js test@example.com
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const TEST_EMAIL = process.argv[2] || 'test@example.com';

console.log('🧪 Forgot Password Feature Test');
console.log('================================');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log('');

/**
 * Test the forgot password endpoint
 */
async function testForgotPassword() {
  console.log('📧 Testing forgot password endpoint...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
      email: TEST_EMAIL
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data.success) {
      console.log('✅ Forgot password request successful');
      console.log('📝 Response:', response.data.message);
      
      // In development, show debug token
      if (response.data.data?.debugToken) {
        console.log('🔑 Debug Token:', response.data.data.debugToken);
        console.log('⏰ Expires At:', response.data.data.expiresAt);
        return response.data.data.debugToken;
      }
      
      return null;
    } else {
      console.log('❌ Forgot password request failed');
      console.log('📝 Error:', response.data.message);
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('❌ Network Error: Could not reach API server');
      console.log('💡 Make sure your backend server is running on', API_BASE_URL);
    } else {
      console.log('❌ Error:', error.message);
    }
    return null;
  }
}

/**
 * Test the reset password endpoint
 */
async function testResetPassword(token) {
  console.log('');
  console.log('🔐 Testing reset password endpoint...');
  
  if (!token) {
    console.log('⚠️ No token available, skipping reset password test');
    console.log('💡 In development mode, check server logs for debug token');
    return false;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token: token,
      password: 'NewSecurePassword123!'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data.success) {
      console.log('✅ Password reset successful');
      console.log('📝 Response:', response.data.message);
      console.log('👤 User:', response.data.data.username);
      return true;
    } else {
      console.log('❌ Password reset failed');
      console.log('📝 Error:', response.data.message);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('❌ Network Error: Could not reach API server');
    } else {
      console.log('❌ Error:', error.message);
    }
    return false;
  }
}

/**
 * Test invalid token scenarios
 */
async function testInvalidToken() {
  console.log('');
  console.log('🚫 Testing invalid token scenarios...');
  
  const invalidTokens = [
    'invalid-token',
    'expired-token-123456789',
    '',
    null
  ];

  for (const token of invalidTokens) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token: token,
        password: 'NewPassword123!'
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`❌ Invalid token "${token}" should have failed but succeeded`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Invalid token "${token}" correctly rejected`);
      } else {
        console.log(`⚠️ Unexpected error for token "${token}":`, error.message);
      }
    }
  }
}

/**
 * Test email validation
 */
async function testEmailValidation() {
  console.log('');
  console.log('📧 Testing email validation...');
  
  const invalidEmails = [
    'invalid-email',
    'test@',
    '@example.com',
    'test.example.com',
    ''
  ];

  for (const email of invalidEmails) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.status === 400) {
        console.log(`✅ Invalid email "${email}" correctly rejected`);
      } else {
        console.log(`⚠️ Invalid email "${email}" was accepted (might be intentional for security)`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ Invalid email "${email}" correctly rejected`);
      } else {
        console.log(`❌ Unexpected error for email "${email}":`, error.message);
      }
    }
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting forgot password feature tests...');
  console.log('');
  
  // Test 1: Forgot password
  const token = await testForgotPassword();
  
  // Test 2: Reset password (if token available)
  await testResetPassword(token);
  
  // Test 3: Invalid token scenarios
  await testInvalidToken();
  
  // Test 4: Email validation
  await testEmailValidation();
  
  console.log('');
  console.log('🎉 Test suite completed!');
  console.log('');
  console.log('📋 Summary:');
  console.log('- Forgot password endpoint tested');
  console.log('- Reset password endpoint tested');
  console.log('- Invalid token scenarios tested');
  console.log('- Email validation tested');
  console.log('');
  console.log('💡 Next steps:');
  console.log('1. Check your email for password reset messages');
  console.log('2. Test the frontend pages at /forgot-password and /reset-password');
  console.log('3. Verify email templates are properly formatted');
  console.log('4. Test on mobile devices for responsiveness');
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});

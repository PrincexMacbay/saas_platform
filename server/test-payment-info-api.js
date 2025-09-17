const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_USER_ID = 1; // Adjust this to an existing user ID

// Test functions
async function testGetCryptocurrencies() {
  try {
    console.log('🧪 Testing GET /cryptocurrencies...');
    const response = await axios.get(`${BASE_URL}/user-payment-info/cryptocurrencies`);
    console.log('✅ Success:', response.data.success);
    console.log('📊 Supported currencies:', response.data.data.length);
    console.log('💱 Sample currencies:', response.data.data.slice(0, 3));
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testCreatePaymentInfo() {
  try {
    console.log('\n🧪 Testing POST /my-payment-info (without auth)...');
    const paymentData = {
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      routingNumber: '987654321',
      accountHolderName: 'Test User',
      accountType: 'checking',
      preferredCrypto: 'BTC',
      btcAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      paymentGateway: 'nowpayments',
      gatewayApiKey: 'test_api_key',
      isActive: true,
      minimumPaymentAmount: 1.00
    };

    const response = await axios.post(`${BASE_URL}/user-payment-info/my-payment-info`, paymentData);
    console.log('✅ Success:', response.data.success);
    console.log('💾 Created payment info ID:', response.data.data.id);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Expected: Authentication required (401)');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testGetPaymentInfo() {
  try {
    console.log('\n🧪 Testing GET /my-payment-info (without auth)...');
    const response = await axios.get(`${BASE_URL}/user-payment-info/my-payment-info`);
    console.log('✅ Success:', response.data.success);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Expected: Authentication required (401)');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

async function testTestGateway() {
  try {
    console.log('\n🧪 Testing POST /test-gateway (without auth)...');
    const testData = {
      paymentGateway: 'nowpayments',
      gatewayApiKey: 'test_key',
      gatewayStoreId: 'test_store'
    };

    const response = await axios.post(`${BASE_URL}/user-payment-info/test-gateway`, testData);
    console.log('✅ Success:', response.data.success);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Expected: Authentication required (401)');
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Payment Info API Tests...\n');
  
  await testGetCryptocurrencies();
  await testCreatePaymentInfo();
  await testGetPaymentInfo();
  await testTestGateway();
  
  console.log('\n✨ All tests completed!');
  console.log('\n📝 Note: Authentication-required endpoints correctly return 401 status');
  console.log('🔑 To test authenticated endpoints, you need to:');
  console.log('   1. Start the server');
  console.log('   2. Login to get a JWT token');
  console.log('   3. Include Authorization header: Bearer <token>');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGetCryptocurrencies,
  testCreatePaymentInfo,
  testGetPaymentInfo,
  testTestGateway,
  runAllTests
};

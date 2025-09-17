const express = require('express');
const router = express.Router();

console.log('🔍 Testing Route Import Issue...\n');

// Test 1: Import the controller
console.log('1️⃣ Testing controller import...');
try {
  const controller = require('./controllers/userPaymentInfoController');
  console.log('✅ Controller imported successfully');
  
  // Test 2: Check each function
  const functions = [
    'getUserPaymentInfo',
    'upsertUserPaymentInfo', 
    'deleteUserPaymentInfo',
    'getSupportedCryptocurrencies',
    'testPaymentGateway',
    'getAllPaymentInfo'
  ];
  
  functions.forEach(funcName => {
    const func = controller[funcName];
    console.log(`   ${funcName}: ${typeof func} ${func ? '(✅)' : '(❌ undefined)'}`);
  });
  
  // Test 3: Try to create a route with the problematic function
  console.log('\n2️⃣ Testing route creation...');
  try {
    router.get('/test', controller.getSupportedCryptocurrencies);
    console.log('✅ Route created successfully');
  } catch (error) {
    console.log(`❌ Route creation failed: ${error.message}`);
  }
  
} catch (error) {
  console.log(`❌ Controller import failed: ${error.message}`);
}

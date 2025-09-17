const path = require('path');

console.log('🔍 Debugging Controller Imports...\n');

// Test 1: Check if the controller file can be required
console.log('1️⃣ Testing if userPaymentInfoController can be required...');
try {
  const controller = require('./controllers/userPaymentInfoController');
  console.log('✅ Controller file loaded successfully');
  
  // Test 2: Check each exported function
  console.log('\n2️⃣ Testing each exported function...');
  
  const functions = [
    'getUserPaymentInfo',
    'upsertUserPaymentInfo', 
    'deleteUserPaymentInfo',
    'getSupportedCryptocurrencies',
    'testPaymentGateway',
    'getAllPaymentInfo'
  ];
  
  functions.forEach(funcName => {
    try {
      const func = controller[funcName];
      if (typeof func === 'function') {
        console.log(`✅ ${funcName}: Function (${func.length} parameters)`);
      } else if (func === undefined) {
        console.log(`❌ ${funcName}: UNDEFINED`);
      } else {
        console.log(`❌ ${funcName}: ${typeof func} (not a function)`);
      }
    } catch (error) {
      console.log(`❌ ${funcName}: Error - ${error.message}`);
    }
  });
  
  // Test 3: Check if cryptoPaymentService is working
  console.log('\n3️⃣ Testing cryptoPaymentService...');
  try {
    const cryptoService = require('./services/cryptoPaymentService');
    console.log('✅ CryptoPaymentService loaded successfully');
    
    if (typeof cryptoService.getSupportedCurrencies === 'function') {
      console.log('✅ getSupportedCurrencies method exists');
    } else {
      console.log('❌ getSupportedCurrencies method is not a function');
    }
  } catch (error) {
    console.log(`❌ CryptoPaymentService error: ${error.message}`);
  }
  
  // Test 4: Check if models can be loaded
  console.log('\n4️⃣ Testing model imports...');
  try {
    const UserPaymentInfo = require('./models/UserPaymentInfo');
    console.log('✅ UserPaymentInfo model loaded successfully');
  } catch (error) {
    console.log(`❌ UserPaymentInfo model error: ${error.message}`);
  }
  
  try {
    const User = require('./models/User');
    console.log('✅ User model loaded successfully');
  } catch (error) {
    console.log(`❌ User model error: ${error.message}`);
  }
  
} catch (error) {
  console.log(`❌ Failed to load controller: ${error.message}`);
  console.log(`   Stack trace: ${error.stack}`);
}

console.log('\n🔍 Debug complete!');

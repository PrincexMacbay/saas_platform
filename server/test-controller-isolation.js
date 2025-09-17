console.log('🔍 Testing Controller Isolation...\n');

// Test 1: Check if cryptoPaymentService can be loaded
console.log('1️⃣ Testing cryptoPaymentService...');
try {
  const cryptoService = require('./services/cryptoPaymentService');
  console.log('✅ CryptoPaymentService loaded');
  console.log(`   Type: ${typeof cryptoService}`);
  console.log(`   Has getSupportedCurrencies: ${typeof cryptoService.getSupportedCurrencies === 'function'}`);
} catch (error) {
  console.log(`❌ CryptoPaymentService failed: ${error.message}`);
  return;
}

// Test 2: Check if models can be loaded
console.log('\n2️⃣ Testing models...');
try {
  const UserPaymentInfo = require('./models/UserPaymentInfo');
  console.log('✅ UserPaymentInfo model loaded');
} catch (error) {
  console.log(`❌ UserPaymentInfo model failed: ${error.message}`);
}

try {
  const User = require('./models/User');
  console.log('✅ User model loaded');
} catch (error) {
  console.log(`❌ User model failed: ${error.message}`);
}

// Test 3: Try to load the controller step by step
console.log('\n3️⃣ Testing controller step by step...');
try {
  // First, just require the file without destructuring
  const controllerModule = require('./controllers/userPaymentInfoController');
  console.log('✅ Controller module loaded');
  console.log(`   Module type: ${typeof controllerModule}`);
  console.log(`   Keys: ${Object.keys(controllerModule).join(', ')}`);
  
  // Now test each function individually
  const functions = [
    'getUserPaymentInfo',
    'upsertUserPaymentInfo', 
    'deleteUserPaymentInfo',
    'getSupportedCryptocurrencies',
    'testPaymentGateway',
    'getAllPaymentInfo'
  ];
  
  functions.forEach(funcName => {
    const func = controllerModule[funcName];
    if (typeof func === 'function') {
      console.log(`   ✅ ${funcName}: Function`);
    } else if (func === undefined) {
      console.log(`   ❌ ${funcName}: UNDEFINED`);
    } else {
      console.log(`   ❌ ${funcName}: ${typeof func}`);
    }
  });
  
} catch (error) {
  console.log(`❌ Controller module failed: ${error.message}`);
  console.log(`   Stack: ${error.stack}`);
}

console.log('\n🔍 Isolation test complete!');

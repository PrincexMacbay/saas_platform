const express = require('express');
const router = express.Router();

console.log('🔍 Debugging Specific Route Issue...\n');

// Test 1: Import the controller functions individually
console.log('1️⃣ Testing controller imports...');
try {
  const {
    getUserPaymentInfo,
    upsertUserPaymentInfo,
    deleteUserPaymentInfo,
    getSupportedCryptocurrencies,
    testPaymentGateway,
    getAllPaymentInfo
  } = require('./controllers/userPaymentInfoController');

  console.log('✅ All controller functions imported successfully');
  console.log(`   getUserPaymentInfo: ${typeof getUserPaymentInfo}`);
  console.log(`   upsertUserPaymentInfo: ${typeof upsertUserPaymentInfo}`);
  console.log(`   deleteUserPaymentInfo: ${typeof deleteUserPaymentInfo}`);
  console.log(`   getSupportedCryptocurrencies: ${typeof getSupportedCryptocurrencies}`);
  console.log(`   testPaymentGateway: ${typeof testPaymentGateway}`);
  console.log(`   getAllPaymentInfo: ${typeof getAllPaymentInfo}`);
  
} catch (error) {
  console.log(`❌ Controller import failed: ${error.message}`);
  return;
}

// Test 2: Test the specific route that's failing (line 14)
console.log('\n2️⃣ Testing the failing route...');
try {
  // This is the exact code from line 14 in userPaymentInfo.js
  const { getSupportedCryptocurrencies } = require('./controllers/userPaymentInfoController');
  
  if (typeof getSupportedCryptocurrencies === 'function') {
    console.log('✅ getSupportedCryptocurrencies is a function');
    
    // Test if we can create a route with it
    const testRouter = express.Router();
    testRouter.get('/test', getSupportedCryptocurrencies);
    console.log('✅ Route created successfully with getSupportedCryptocurrencies');
    
  } else {
    console.log(`❌ getSupportedCryptocurrencies is ${typeof getSupportedCryptocurrencies}`);
  }
  
} catch (error) {
  console.log(`❌ Route test failed: ${error.message}`);
  console.log(`   Stack trace: ${error.stack}`);
}

// Test 3: Check if there's a circular dependency issue
console.log('\n3️⃣ Checking for circular dependencies...');
try {
  // Try to require the routes file
  const userPaymentInfoRoutes = require('./routes/userPaymentInfo');
  console.log('✅ Routes file loaded successfully');
  console.log(`   Routes type: ${typeof userPaymentInfoRoutes}`);
  
  if (userPaymentInfoRoutes && typeof userPaymentInfoRoutes === 'function') {
    console.log('✅ Routes export is a function (Router)');
  } else {
    console.log(`❌ Routes export is not a Router: ${typeof userPaymentInfoRoutes}`);
  }
  
} catch (error) {
  console.log(`❌ Routes file load failed: ${error.message}`);
  console.log(`   Stack trace: ${error.stack}`);
}

console.log('\n🔍 Route debug complete!');

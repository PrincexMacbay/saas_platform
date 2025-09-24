// Simple CORS test script
// Run this with: node test-cors.js

const https = require('https');
const http = require('http');

// Test function
async function testCORS(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'GET',
      headers: {
        'Origin': 'https://client-seven-sage.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 CORS Headers:`);
      console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`);
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`📄 Response:`, response);
        } catch (e) {
          console.log(`📄 Response: ${data}`);
        }
        resolve(res.statusCode === 200);
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Test OPTIONS request (preflight)
async function testPreflight(url, description) {
  return new Promise((resolve) => {
    console.log(`\n🛫 Testing Preflight: ${description}`);
    console.log(`📍 URL: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://client-seven-sage.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    }, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 CORS Headers:`);
      console.log(`   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Credentials: ${res.headers['access-control-allow-credentials'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`);
      resolve(res.statusCode === 200 || res.statusCode === 204);
    });
    
    req.on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting CORS Tests...\n');
  
  // Replace with your actual Vercel URL
  const vercelUrl = 'https://your-app-name.vercel.app';
  
  const tests = [
    { url: `${vercelUrl}/health`, desc: 'Health Check' },
    { url: `${vercelUrl}/test`, desc: 'Test Endpoint' },
    { url: `${vercelUrl}/cors-test`, desc: 'CORS Test Endpoint' },
    { url: `${vercelUrl}/api/test`, desc: 'API Test Endpoint' }
  ];
  
  const preflightTests = [
    { url: `${vercelUrl}/cors-test`, desc: 'CORS Test Preflight' },
    { url: `${vercelUrl}/api/test`, desc: 'API Preflight' }
  ];
  
  console.log('📝 Note: Update the vercelUrl variable with your actual Vercel deployment URL');
  console.log(`🔗 Current URL: ${vercelUrl}`);
  
  let passed = 0;
  let total = tests.length + preflightTests.length;
  
  // Test regular endpoints
  for (const test of tests) {
    const success = await testCORS(test.url, test.desc);
    if (success) passed++;
  }
  
  // Test preflight requests
  for (const test of preflightTests) {
    const success = await testPreflight(test.url, test.desc);
    if (success) passed++;
  }
  
  console.log(`\n📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All CORS tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check your CORS configuration.');
  }
}

// Run the tests
runTests().catch(console.error);

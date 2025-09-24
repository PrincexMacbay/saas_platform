// Script to help get the correct Supabase connection string for Render
require('dotenv').config();

console.log('🔍 Supabase Connection Helper');
console.log('============================');

const currentUrl = process.env.DATABASE_URL;
console.log('Current DATABASE_URL:', currentUrl);

if (currentUrl && currentUrl.includes('supabase.co')) {
  // Parse the current URL
  const url = new URL(currentUrl);
  const host = url.hostname;
  const port = url.port || '5432';
  const username = url.username;
  const password = url.password;
  const database = url.pathname.substring(1);
  
  console.log('\n📋 Parsed Connection Details:');
  console.log('- Host:', host);
  console.log('- Port:', port);
  console.log('- Username:', username);
  console.log('- Database:', database);
  
  // Generate alternative connection strings
  console.log('\n🔧 Alternative Connection Strings:');
  
  // Option 1: Direct connection with IPv4 preference
  console.log('\n1. Direct Connection (Current):');
  console.log(currentUrl);
  
  // Option 2: Connection pooler (recommended for Render)
  const poolerUrl = currentUrl.replace('db.', 'db-pooler.');
  console.log('\n2. Connection Pooler (Recommended for Render):');
  console.log(poolerUrl);
  
  // Option 3: Non-pooling connection
  const nonPoolingUrl = currentUrl.replace('db.', 'db-non-pooling.');
  console.log('\n3. Non-Pooling Connection:');
  console.log(nonPoolingUrl);
  
  console.log('\n💡 Recommendations:');
  console.log('- Try the Connection Pooler URL first');
  console.log('- If that fails, try the Non-Pooling URL');
  console.log('- Make sure to set this as DATABASE_URL in Render');
  
} else {
  console.log('❌ No Supabase DATABASE_URL found');
  console.log('Please set your DATABASE_URL environment variable');
}

console.log('\n🚀 Next Steps:');
console.log('1. Copy one of the alternative URLs above');
console.log('2. Set it as DATABASE_URL in your Render service');
console.log('3. Redeploy your service');
console.log('4. Check the logs for connection success');

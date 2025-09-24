// Debug script to check DATABASE_URL format
require('dotenv').config();

console.log('🔍 DATABASE_URL Debug Information');
console.log('==================================');

const databaseUrl = process.env.DATABASE_URL;

console.log('Raw DATABASE_URL:');
console.log('- Type:', typeof databaseUrl);
console.log('- Length:', databaseUrl ? databaseUrl.length : 'null/undefined');
console.log('- First 20 chars:', databaseUrl ? databaseUrl.substring(0, 20) : 'null/undefined');
console.log('- Last 20 chars:', databaseUrl ? databaseUrl.substring(Math.max(0, databaseUrl.length - 20)) : 'null/undefined');

if (databaseUrl) {
  console.log('\nFull DATABASE_URL:');
  console.log(databaseUrl);
  
  console.log('\nURL Analysis:');
  console.log('- Starts with postgresql://:', databaseUrl.startsWith('postgresql://'));
  console.log('- Starts with postgres://:', databaseUrl.startsWith('postgres://'));
  console.log('- Contains @:', databaseUrl.includes('@'));
  console.log('- Contains :5432:', databaseUrl.includes(':5432'));
  
  // Try to parse as URL
  try {
    const url = new URL(databaseUrl);
    console.log('\nParsed URL:');
    console.log('- Protocol:', url.protocol);
    console.log('- Hostname:', url.hostname);
    console.log('- Port:', url.port);
    console.log('- Username:', url.username);
    console.log('- Database:', url.pathname.substring(1));
  } catch (error) {
    console.log('\n❌ URL parsing failed:', error.message);
  }
} else {
  console.log('❌ DATABASE_URL is not set or is null/undefined');
}

console.log('\n🔧 Recommended Fix:');
console.log('Your current DATABASE_URL has the variable name included. In Render, set it to:');
console.log('postgresql://postgres.iptfgbgnfcipeggazsxi:Macbayprince05@@aws-1-us-east-1.pooler.supabase.com:6543/postgres');
console.log('\n(Remove the "DATABASE_URL=" prefix)');

require('dotenv').config();

console.log('🔍 Checking .env file configuration...\n');

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'PORT',
  'PHONEPE_MERCHANT_ID',
  'PHONEPE_SALT_KEY',
  'PHONEPE_SALT_INDEX',
  'PHONEPE_BASE_URL',
  'PHONEPE_REDIRECT_URL'
];

let allPresent = true;

console.log('📋 Environment Variables Status:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  } else {
    console.log(`❌ ${varName}: NOT FOUND`);
    allPresent = false;
  }
});

console.log('\n📋 PhonePe Configuration:');
console.log(`   Merchant ID: ${process.env.PHONEPE_MERCHANT_ID || 'NOT SET'}`);
console.log(`   Salt Key: ${process.env.PHONEPE_SALT_KEY || 'NOT SET'}`);
console.log(`   Salt Index: ${process.env.PHONEPE_SALT_INDEX || 'NOT SET'}`);
console.log(`   Base URL: ${process.env.PHONEPE_BASE_URL || 'NOT SET'}`);
console.log(`   Redirect URL: ${process.env.PHONEPE_REDIRECT_URL || 'NOT SET'}`);

if (allPresent) {
  console.log('\n🎉 All environment variables are properly configured!');
  console.log('✅ PhonePe integration is ready for testing');
} else {
  console.log('\n⚠️  Some environment variables are missing');
  console.log('   Please check your .env file configuration');
}

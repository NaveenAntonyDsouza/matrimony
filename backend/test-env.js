// Test environment variables loading
require('dotenv').config();

console.log('🔍 Environment Variables Test:');
console.log('PHONEPE_MERCHANT_ID:', process.env.PHONEPE_MERCHANT_ID);
console.log('PHONEPE_SALT_KEY:', process.env.PHONEPE_SALT_KEY);
console.log('PHONEPE_SALT_INDEX:', process.env.PHONEPE_SALT_INDEX);
console.log('PHONEPE_BASE_URL:', process.env.PHONEPE_BASE_URL);
console.log('PHONEPE_REDIRECT_URL:', process.env.PHONEPE_REDIRECT_URL);

// Test PhonePe service initialization
try {
  const phonepeService = require('./services/phonepeService');
  console.log('\n✅ PhonePe Service initialized successfully');
  console.log('Merchant ID:', phonepeService.merchantId);
  console.log('Base URL:', phonepeService.baseUrl);
} catch (error) {
  console.log('\n❌ PhonePe Service initialization failed:', error.message);
}
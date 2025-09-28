#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 PhonePe Payment Gateway Setup\n');

// Create .env file in backend directory
const envContent = `# Database
MONGODB_URI=mongodb://localhost:27017/shaadi-clone

# JWT
JWT_SECRET=your_jwt_secret_key_here_${Date.now()}
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development

# API Base URL
API_BASE_URL=http://localhost:5000

# PhonePe Configuration (Your Credentials)
PHONEPE_MERCHANT_ID=SU2509191910120899506220
PHONEPE_SALT_KEY=3cd9c463-9e15-4654-9485-6227d8b988af
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=http://localhost:3000/payment/callback

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists in backend directory');
    console.log('   Please update it with your PhonePe credentials manually');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file in backend directory');
  }

  console.log('\n📋 Your PhonePe Credentials:');
  console.log('   Merchant ID: SU2509191910120899506220');
  console.log('   Salt Key: 3cd9c463-9e15-4654-9485-6227d8b988af');
  console.log('   Salt Index: 1');
  console.log('   Environment: Sandbox (Test)');

  console.log('\n🔧 Next Steps:');
  console.log('1. Install backend dependencies:');
  console.log('   cd backend && npm install phonepe-pg-sdk crypto axios');
  console.log('\n2. Start the backend server:');
  console.log('   cd backend && npm run dev');
  console.log('\n3. Start the frontend:');
  console.log('   npm start');
  console.log('\n4. Test the payment integration:');
  console.log('   cd backend && node test-payment.js');
  console.log('\n5. Navigate to http://localhost:3000/subscription to test payments');

  console.log('\n🧪 Test Cards (PhonePe Sandbox):');
  console.log('   Success: 4111 1111 1111 1111');
  console.log('   Failure: 4000 0000 0000 0002');
  console.log('   CVV: Any 3 digits');
  console.log('   Expiry: Any future date');

  console.log('\n📚 Documentation:');
  console.log('   PhonePe Developer Portal: https://developer.phonepe.com/');
  console.log('   Payment Gateway Docs: https://developer.phonepe.com/payment-gateway');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\n📝 Manual Setup:');
  console.log('1. Create .env file in backend directory');
  console.log('2. Copy the content from backend/env-template.txt');
  console.log('3. Update with your specific configuration');
}


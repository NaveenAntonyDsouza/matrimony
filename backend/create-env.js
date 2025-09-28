const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env file for PhonePe integration...\n');

const envContent = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shaadi-clone

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_${Date.now()}
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# API Base URL
API_BASE_URL=http://localhost:5000

# PhonePe Payment Gateway Configuration
PHONEPE_MERCHANT_ID=SU2509191910120899506220
PHONEPE_SALT_KEY=3cd9c463-9e15-4654-9485-6227d8b988af
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_REDIRECT_URL=http://localhost:3000/payment/callback

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
`;

const envPath = path.join(__dirname, '.env');

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists');
    console.log('   Please add the PhonePe configuration manually:');
    console.log('\n   PHONEPE_MERCHANT_ID=SU2509191910120899506220');
    console.log('   PHONEPE_SALT_KEY=3cd9c463-9e15-4654-9485-6227d8b988af');
    console.log('   PHONEPE_SALT_INDEX=1');
    console.log('   PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox');
    console.log('   PHONEPE_REDIRECT_URL=http://localhost:3000/payment/callback');
  } else {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('   PhonePe configuration added with your credentials');
  }

  console.log('\n📋 Your PhonePe Credentials:');
  console.log('   Merchant ID: SU2509191910120899506220');
  console.log('   Salt Key: 3cd9c463-9e15-4654-9485-6227d8b988af');
  console.log('   Environment: Sandbox (Test)');

  console.log('\n🚀 Next Steps:');
  console.log('1. Start the backend server: npm run dev');
  console.log('2. Start the frontend: npm start');
  console.log('3. Test payment: http://localhost:3000/subscription');

} catch (error) {
  console.error('❌ Failed to create .env file:', error.message);
  console.log('\n📝 Manual Setup:');
  console.log('1. Create .env file in backend directory');
  console.log('2. Add the PhonePe configuration shown above');
}

// Verification script for PhonePe payment gateway setup
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PhonePe Payment Gateway Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Read and check .env content
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for PhonePe configuration
  const requiredVars = [
    'PHONEPE_MERCHANT_ID',
    'PHONEPE_SALT_KEY',
    'PHONEPE_SALT_INDEX',
    'PHONEPE_BASE_URL',
    'PHONEPE_REDIRECT_URL'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('✅ PhonePe configuration found in .env file');
  } else {
    console.log('❌ Missing PhonePe configuration in .env file:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
  }
} else {
  console.log('❌ .env file not found');
  console.log('   Please create .env file with PhonePe configuration');
}

// Check if package.json has PhonePe dependencies
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['phonepe-pg-sdk', 'crypto', 'axios'];
  let missingDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('✅ PhonePe dependencies found in package.json');
  } else {
    console.log('❌ Missing dependencies in package.json:');
    missingDeps.forEach(dep => {
      console.log(`   - ${dep}`);
    });
  }
}

// Check if PhonePe service exists
const phonepeServicePath = path.join(__dirname, 'services', 'phonepeService.js');
if (fs.existsSync(phonepeServicePath)) {
  console.log('✅ PhonePe service file exists');
} else {
  console.log('❌ PhonePe service file not found');
}

// Check if payment routes exist
const paymentRoutesPath = path.join(__dirname, 'routes', 'payments.js');
if (fs.existsSync(paymentRoutesPath)) {
  console.log('✅ Payment routes file exists');
} else {
  console.log('❌ Payment routes file not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start backend: npm run dev');
console.log('3. Start frontend: npm start');
console.log('4. Test payment: http://localhost:3000/subscription');

console.log('\n🧪 Test Cards (PhonePe Sandbox):');
console.log('   Success: 4111 1111 1111 1111');
console.log('   Failure: 4000 0000 0000 0002');
console.log('   CVV: Any 3 digits');
console.log('   Expiry: Any future date');


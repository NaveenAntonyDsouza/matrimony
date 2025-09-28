// Test script for PhonePe payment integration
require('dotenv').config();
const phonepeService = require('./services/phonepeService');

async function testPhonePeIntegration() {
  console.log('🧪 Testing PhonePe Payment Integration with Your Credentials...\n');
  console.log('📋 Your PhonePe Credentials:');
  console.log('   Merchant ID: PGTESTPAYUAT86');
  console.log('   Salt Key: 96434309-7796-489d-8924-ab56988a6076\n');

  try {
    // Test 1: Create Payment Request
    console.log('1. Testing Payment Request Creation...');
    const paymentData = {
      amount: 1599,
      userId: 'test_user_123',
      planType: 'Premium',
      duration: '1 month',
      userInfo: {
        phone: '9999999999',
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    const paymentResult = await phonepeService.createPaymentRequest(paymentData);
    
    if (paymentResult.success) {
      console.log('✅ Payment request created successfully');
      console.log(`   Transaction ID: ${paymentResult.transactionId}`);
      console.log(`   Payment URL: ${paymentResult.paymentUrl}`);
    } else {
      console.log('❌ Payment request failed:', paymentResult.error);
    }

    // Test 2: Verify Payment (with dummy transaction ID)
    console.log('\n2. Testing Payment Verification...');
    const testTransactionId = 'TXN_' + Date.now();
    const verificationResult = await phonepeService.verifyPayment(testTransactionId);
    
    if (verificationResult.success) {
      console.log('✅ Payment verification endpoint accessible');
    } else {
      console.log('⚠️  Payment verification failed (expected for test transaction):', verificationResult.error);
    }

    // Test 3: Handle Callback
    console.log('\n3. Testing Callback Handling...');
    const testCallbackData = {
      response: Buffer.from(JSON.stringify({
        merchantTransactionId: 'TXN_123456',
        state: 'COMPLETED',
        code: 'PAYMENT_SUCCESS',
        responseCode: 'SUCCESS'
      })).toString('base64')
    };

    const callbackResult = await phonepeService.handlePaymentCallback(testCallbackData);
    
    if (callbackResult.success) {
      console.log('✅ Callback handling works correctly');
      console.log(`   Transaction ID: ${callbackResult.transactionId}`);
      console.log(`   Status: ${callbackResult.status}`);
    } else {
      console.log('❌ Callback handling failed:', callbackResult.error);
    }

    console.log('\n🎉 PhonePe Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Set up PhonePe merchant credentials in .env file');
    console.log('2. Start the backend server: npm run dev');
    console.log('3. Start the frontend: npm start');
    console.log('4. Navigate to /subscription to test payment flow');
    console.log('5. Use PhonePe test cards for testing');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhonePeIntegration();

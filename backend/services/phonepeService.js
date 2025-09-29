const crypto = require('crypto');
const axios = require('axios');

class PhonePeService {
  constructor() {
    // Debug logging for environment variables
    console.log('🔍 PhonePe Environment Variables Debug:');
    console.log('PHONEPE_MERCHANT_ID:', process.env.PHONEPE_MERCHANT_ID ? '✅ Set' : '❌ Missing');
    console.log('PHONEPE_SALT_KEY:', process.env.PHONEPE_SALT_KEY ? '✅ Set' : '❌ Missing');
    console.log('PHONEPE_SALT_INDEX:', process.env.PHONEPE_SALT_INDEX ? '✅ Set' : '❌ Missing');
    console.log('PHONEPE_BASE_URL:', process.env.PHONEPE_BASE_URL ? '✅ Set' : '❌ Missing');
    console.log('PHONEPE_REDIRECT_URL:', process.env.PHONEPE_REDIRECT_URL ? '✅ Set' : '❌ Missing');
    
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX;
    this.baseUrl = process.env.PHONEPE_BASE_URL;
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    
    // Validate required environment variables
    const missingVars = [];
    if (!this.merchantId) missingVars.push('PHONEPE_MERCHANT_ID: MISSING');
    if (!this.saltKey) missingVars.push('PHONEPE_SALT_KEY: MISSING');
    if (!this.saltIndex) missingVars.push('PHONEPE_SALT_INDEX: MISSING');
    if (!this.baseUrl) missingVars.push('PHONEPE_BASE_URL: MISSING');
    if (!this.redirectUrl) missingVars.push('PHONEPE_REDIRECT_URL: MISSING');

    if (missingVars.length > 0) {
      console.error('❌ Missing PhonePe environment variables:');
      missingVars.forEach(varName => console.error(varName));
      console.warn('⚠️ PhonePe service will be disabled. Payment functionality will not work.');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
      console.log('✅ PhonePe service configured successfully');
    }
  }

  // Generate SHA256 hash
  generateSHA256(payload) {
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  // Generate X-VERIFY header
  generateXVerify(base64Payload) {
    const sha256Hash = this.generateSHA256(base64Payload + '/pg/v1/pay' + this.saltKey);
    return sha256Hash + '###' + this.saltIndex;
  }

  // Create payment request using PhonePe Standard Checkout API
  async createPaymentRequest(paymentData) {
    if (!this.isConfigured) {
      throw new Error('PhonePe service is not configured. Please check environment variables.');
    }
    
    try {
      const { amount, userId, planType, duration, userInfo } = paymentData;
      
      // Generate unique transaction ID
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the request payload according to PhonePe API documentation
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: amount * 100, // Convert to paise
        redirectUrl: this.redirectUrl,
        redirectMode: 'POST',
        callbackUrl: `${process.env.API_BASE_URL || 'http://localhost:5000'}/api/payments/callback`,
        mobileNumber: userInfo.phone || '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const payloadString = JSON.stringify(payload);
      const base64Payload = Buffer.from(payloadString).toString('base64');
      const xVerify = this.generateXVerify(base64Payload);

      // Use the correct PhonePe API endpoint
      const response = await axios.post(
        `${this.baseUrl}/pg/v1/pay`,
        { request: base64Payload },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      // Extract payment URL from response
      const paymentUrl = response.data?.data?.instrumentResponse?.redirectInfo?.url;
      
      if (!paymentUrl) {
        throw new Error('Payment URL not received from PhonePe');
      }

      return {
        success: true,
        transactionId,
        paymentUrl,
        data: response.data
      };
    } catch (error) {
      console.error('PhonePe payment creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Verify payment status
  async verifyPayment(transactionId) {
    if (!this.isConfigured) {
      throw new Error('PhonePe service is not configured. Please check environment variables.');
    }
    
    try {
      // For status check, X-VERIFY is generated differently
      const statusEndpoint = `/pg/v1/status/${this.merchantId}/${transactionId}`;
      const sha256Hash = this.generateSHA256(statusEndpoint + this.saltKey);
      const xVerify = sha256Hash + '###' + this.saltIndex;

      const response = await axios.get(
        `${this.baseUrl}${statusEndpoint}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('PhonePe payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Handle payment callback
  async handlePaymentCallback(callbackData) {
    if (!this.isConfigured) {
      throw new Error('PhonePe service is not configured. Please check environment variables.');
    }
    
    try {
      const { response } = callbackData;
      const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
      
      return {
        success: true,
        transactionId: decodedResponse.merchantTransactionId,
        status: decodedResponse.state,
        code: decodedResponse.code,
        message: decodedResponse.responseCode,
        data: decodedResponse
      };
    } catch (error) {
      console.error('PhonePe callback handling error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PhonePeService();

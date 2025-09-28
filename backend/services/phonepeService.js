const crypto = require('crypto');
const axios = require('axios');

class PhonePeService {
  constructor() {
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX;
    this.baseUrl = process.env.PHONEPE_BASE_URL;
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    
    // Validate required environment variables
    if (!this.merchantId || !this.saltKey || !this.saltIndex || !this.baseUrl || !this.redirectUrl) {
      throw new Error('Missing required PhonePe environment variables. Please check your .env file.');
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

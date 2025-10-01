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
    console.log('PHONEPE_CLIENT_ID:', process.env.PHONEPE_CLIENT_ID ? '✅ Set' : '❌ Missing');
    console.log('PHONEPE_CLIENT_SECRET:', process.env.PHONEPE_CLIENT_SECRET ? '✅ Set' : '❌ Missing');
    console.log('PHONEPE_CLIENT_VERSION:', process.env.PHONEPE_CLIENT_VERSION ? '✅ Set' : '❌ Missing');
    
    this.merchantId = process.env.PHONEPE_MERCHANT_ID;
    this.saltKey = process.env.PHONEPE_SALT_KEY;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX;
    this.baseUrl = process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/pg-sandbox';
    this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    
    // OAuth credentials
    this.clientId = process.env.PHONEPE_CLIENT_ID;
    this.clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    this.clientVersion = process.env.PHONEPE_CLIENT_VERSION;
    
    // Enable mock mode for testing when credentials are invalid
    this.mockMode = process.env.PHONEPE_MOCK_MODE === 'true' || false;
    console.log('🧪 Mock Mode Status:', this.mockMode ? '✅ ENABLED' : '❌ DISABLED');
    
    // Validate required environment variables for v1 API
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
    const sha256Hash = this.generateSHA256(base64Payload + '/checkout/v2/pay' + this.saltKey);
    return sha256Hash + '###' + this.saltIndex;
  }

  // Get OAuth token for API authentication
  async getOAuthToken() {
    try {
      const authUrl = this.baseUrl.includes('sandbox') 
        ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token'
        : 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';

      // Use URL-encoded format for OAuth token request
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('client_version', this.clientVersion);

      console.log('🔑 OAuth Request Details:');
      console.log('Auth URL:', authUrl);
      console.log('Client ID:', this.clientId);
      console.log('Client Version:', this.clientVersion);

      const response = await axios.post(authUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('✅ OAuth Response:', response.data);
      
      if (response.data && response.data.access_token) {
        console.log('✅ OAuth token obtained successfully');
        return response.data.access_token;
      } else {
        throw new Error('Access token not found in response');
      }
    } catch (error) {
      console.error('❌ OAuth token error:', error.response?.data || error.message);
      console.error('❌ OAuth request failed with status:', error.response?.status);
      console.error('❌ Full error details:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      });
      throw new Error('Failed to get OAuth token');
    }
  }

  // Create payment request using PhonePe Standard Checkout API
  async createPaymentRequest(paymentData) {
    if (!this.isConfigured) {
      throw new Error('PhonePe service is not configured. Please check environment variables.');
    }
    
    // Mock mode for testing when credentials are invalid
    if (this.mockMode) {
      console.log('🧪 Mock Mode: Simulating PhonePe payment request');
      const { amount, userId, planType, duration } = paymentData;
      const transactionId = `MOCK_TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        paymentUrl: `http://localhost:3000/payment/callback?transactionId=${transactionId}&status=SUCCESS&amount=${amount}`,
        transactionId: transactionId,
        message: 'Mock payment request created successfully'
      };
    }

    try {
      const { amount, userId, planType, duration, userInfo } = paymentData;
      
      // Generate unique merchant order ID
      const merchantOrderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get OAuth token for v2 API authentication
      const accessToken = await this.getOAuthToken();
      if (!accessToken) {
        throw new Error('Failed to obtain OAuth access token');
      }
      
      // Create the request payload according to PhonePe v2 API documentation
      const payload = {
        merchantOrderId: merchantOrderId,
        amount: amount * 100, // Convert to paise
        paymentFlow: {
          type: "PG_CHECKOUT",
          message: `Payment for ${planType} subscription (${duration} months)`,
          merchantUrls: {
            redirectUrl: `${this.redirectUrl}?merchantOrderId=${merchantOrderId}`
          }
        },
        metaInfo: {
          udf1: planType,
          udf2: duration.toString(),
          udf3: userId,
          udf4: "matrimony-subscription",
          udf5: ""
        }
      };

      // Use v2 API endpoint
      const apiEndpoint = '/checkout/v2/pay';
      const apiUrl = `${this.baseUrl}${apiEndpoint}`;

      console.log('🔄 PhonePe v2 API Request:', {
        url: apiUrl,
        payload: payload,
        hasToken: !!accessToken
      });

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`
        }
      });

      console.log('📥 PhonePe v2 API Response:', {
        status: response.status,
        data: response.data
      });

      // Extract payment URL from v2 API response
      if (response.data && response.data.redirectUrl) {
        return {
          success: true,
          paymentUrl: response.data.redirectUrl,
          transactionId: merchantOrderId,
          orderId: response.data.orderId,
          message: 'Payment request created successfully'
        };
      } else {
        console.error('❌ PhonePe Payment Error: Invalid response format', response.data);
        throw new Error('Invalid payment response from PhonePe');
      }
    } catch (error) {
      console.error('PhonePe payment creation error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Verify payment status using v2 API
  async verifyPayment(merchantOrderId) {
    if (!this.isConfigured) {
      throw new Error('PhonePe service is not configured. Please check environment variables.');
    }

    // Mock mode for testing
    if (this.mockMode) {
      console.log('🧪 Mock Mode: Simulating payment verification for order:', merchantOrderId);
      return {
        success: true,
        data: {
          orderId: `OMO${Date.now()}`,
          state: 'COMPLETED',
          amount: 159900, // Mock amount
          paymentDetails: [{
            paymentMode: 'UPI_QR',
            transactionId: `OM${Date.now()}`,
            timestamp: Date.now(),
            amount: 159900,
            state: 'COMPLETED'
          }]
        }
      };
    }
    
    try {
      // Get OAuth token for v2 API authentication
      const accessToken = await this.getOAuthToken();
      if (!accessToken) {
        throw new Error('Failed to obtain OAuth access token');
      }
      
      // Use v2 API endpoint for order status verification
      const statusEndpoint = `/checkout/v2/order/${merchantOrderId}/status`;
      const apiUrl = `${this.baseUrl}${statusEndpoint}`;
      
      console.log('🔍 PhonePe v2 API Verification:', {
        merchantOrderId,
        endpoint: statusEndpoint,
        hasToken: !!accessToken
      });

      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `O-Bearer ${accessToken}`
        },
        params: {
          details: false // Get only latest attempt details
        }
      });

      console.log('📥 PhonePe v2 API Verification Response:', {
        status: response.status,
        data: response.data
      });

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
      // For v2 API, we should verify the payment status using the order ID
      // instead of decoding callback response
      const { merchantOrderId } = callbackData;
      
      if (!merchantOrderId) {
        throw new Error('Merchant order ID is required for payment verification');
      }
      
      // Verify payment status using v2 API
      const verificationResult = await this.verifyPayment(merchantOrderId);
      
      if (verificationResult.success && verificationResult.data) {
        const orderData = verificationResult.data;
        return {
          success: true,
          transactionId: merchantOrderId,
          orderId: orderData.orderId,
          status: orderData.state,
          amount: orderData.amount,
          paymentDetails: orderData.paymentDetails,
          data: orderData
        };
      } else {
        throw new Error('Payment verification failed');
      }
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

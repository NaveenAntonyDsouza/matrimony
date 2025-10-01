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

  // Create payment request using PhonePe API
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

    // Check if we're in sandbox environment
    const isSandbox = this.baseUrl.includes('sandbox') || this.baseUrl.includes('pgsandbox');
    
    if (isSandbox) {
      return this.createSandboxPaymentRequest(paymentData);
    } else {
      return this.createProductionPaymentRequest(paymentData);
    }
  }

  // Create payment request for sandbox environment (v1 API without OAuth)
  async createSandboxPaymentRequest(paymentData) {
    try {
      const { amount, userId, planType, duration, userInfo } = paymentData;
      
      // Generate unique merchant transaction ID
      const merchantTransactionId = `MT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const merchantUserId = `USER_${userId}_${Date.now()}`;
      
      // Create the request payload according to PhonePe v1 sandbox API
      const payload = {
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: merchantUserId,
        amount: amount * 100, // Convert to paise
        redirectUrl: `${this.redirectUrl}?merchantTransactionId=${merchantTransactionId}`,
        redirectMode: "REDIRECT",
        callbackUrl: `${this.redirectUrl}?merchantTransactionId=${merchantTransactionId}`,
        mobileNumber: userInfo?.phone || "9999999999",
        paymentInstrument: {
          type: "PAY_PAGE"
        }
      };

      // Convert payload to base64
      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      
      // Generate X-VERIFY header for v1 API
      const string = base64Payload + "/pg/v1/pay" + this.saltKey;
      const sha256Hash = this.generateSHA256(string);
      const xVerify = sha256Hash + "###" + this.saltIndex;

      // Use v1 API endpoint for sandbox
      const apiUrl = `${this.baseUrl}/pg/v1/pay`;

      console.log('🔄 PhonePe v1 Sandbox API Request:', {
        url: apiUrl,
        merchantId: this.merchantId,
        merchantTransactionId: merchantTransactionId,
        amount: amount * 100
      });

      const response = await axios.post(apiUrl, {
        request: base64Payload
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify
        }
      });

      console.log('📥 PhonePe v1 Sandbox API Response:', {
        status: response.status,
        data: response.data
      });

      // Extract payment URL from v1 API response
      if (response.data && response.data.success && response.data.data && response.data.data.instrumentResponse) {
        const redirectInfo = response.data.data.instrumentResponse.redirectInfo;
        return {
          success: true,
          paymentUrl: redirectInfo.url,
          transactionId: merchantTransactionId,
          message: 'Sandbox payment request created successfully'
        };
      } else {
        console.error('❌ PhonePe Sandbox Payment Error: Invalid response format', response.data);
        throw new Error('Invalid payment response from PhonePe sandbox');
      }
    } catch (error) {
      console.error('PhonePe sandbox payment creation error:', {
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

  // Create payment request for production environment (v2 API with OAuth)
  async createProductionPaymentRequest(paymentData) {
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

      console.log('🔄 PhonePe v2 Production API Request:', {
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

      console.log('📥 PhonePe v2 Production API Response:', {
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
      console.error('PhonePe production payment creation error:', {
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

  // Verify payment status
  async verifyPayment(transactionId) {
    if (!this.isConfigured) {
      throw new Error('PhonePe service is not configured. Please check environment variables.');
    }

    // Mock mode for testing
    if (this.mockMode) {
      console.log('🧪 Mock Mode: Simulating payment verification for transaction:', transactionId);
      return {
        success: true,
        data: {
          code: 'PAYMENT_SUCCESS',
          data: {
            orderId: `OMO${Date.now()}`,
            state: 'COMPLETED',
            responseCode: 'SUCCESS',
            amount: 159900, // Mock amount
            paymentDetails: [{
              paymentMode: 'UPI_QR',
              transactionId: `OM${Date.now()}`,
              timestamp: Date.now(),
              amount: 159900,
              state: 'COMPLETED'
            }]
          }
        }
      };
    }

    // Check if we're in sandbox environment
    const isSandbox = this.baseUrl.includes('sandbox') || this.baseUrl.includes('pgsandbox');
    
    if (isSandbox) {
      return this.verifySandboxPayment(transactionId);
    } else {
      return this.verifyProductionPayment(transactionId);
    }
  }

  // Verify payment status for sandbox environment (v1 API without OAuth)
  async verifySandboxPayment(merchantTransactionId) {
    try {
      // Generate X-VERIFY header for v1 status API
      const statusEndpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
      const string = statusEndpoint + this.saltKey;
      const sha256Hash = this.generateSHA256(string);
      const xVerify = sha256Hash + "###" + this.saltIndex;

      // Use v1 API endpoint for sandbox status check
      const apiUrl = `${this.baseUrl}${statusEndpoint}`;
      
      console.log('🔍 PhonePe v1 Sandbox API Verification:', {
        merchantTransactionId,
        endpoint: statusEndpoint,
        url: apiUrl
      });

      const response = await axios.get(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': this.merchantId
        }
      });

      console.log('📥 PhonePe v1 Sandbox API Verification Response:', {
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('PhonePe sandbox payment verification error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Verify payment status for production environment (v2 API with OAuth)
  async verifyProductionPayment(merchantOrderId) {
    try {
      // Get OAuth token for v2 API authentication
      const accessToken = await this.getOAuthToken();
      if (!accessToken) {
        throw new Error('Failed to obtain OAuth access token');
      }
      
      // Use v2 API endpoint for order status verification
      const statusEndpoint = `/checkout/v2/order/${merchantOrderId}/status`;
      const apiUrl = `${this.baseUrl}${statusEndpoint}`;
      
      console.log('🔍 PhonePe v2 Production API Verification:', {
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

      console.log('📥 PhonePe v2 Production API Verification Response:', {
        status: response.status,
        data: response.data
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('PhonePe production payment verification error:', error.response?.data || error.message);
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
      // Check if we're in sandbox environment
      const isSandbox = this.baseUrl.includes('sandbox') || this.baseUrl.includes('pgsandbox');
      
      let transactionId;
      if (isSandbox) {
        // For sandbox (v1 API), we use merchantTransactionId
        transactionId = callbackData.merchantTransactionId;
        if (!transactionId) {
          throw new Error('Merchant transaction ID is required for sandbox payment verification');
        }
      } else {
        // For production (v2 API), we use merchantOrderId
        transactionId = callbackData.merchantOrderId;
        if (!transactionId) {
          throw new Error('Merchant order ID is required for production payment verification');
        }
      }
      
      // Verify payment status using appropriate API
      const verificationResult = await this.verifyPayment(transactionId);
      
      if (verificationResult.success && verificationResult.data) {
        const paymentData = verificationResult.data;
        
        if (isSandbox) {
          // Handle v1 sandbox API response format
          return {
            success: true,
            transactionId: transactionId,
            status: paymentData.code,
            amount: paymentData.data?.amount,
            data: paymentData
          };
        } else {
          // Handle v2 production API response format
          return {
            success: true,
            transactionId: transactionId,
            orderId: paymentData.orderId,
            status: paymentData.state,
            amount: paymentData.amount,
            paymentDetails: paymentData.paymentDetails,
            data: paymentData
          };
        }
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

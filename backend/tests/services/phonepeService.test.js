const axios = require('axios');
const crypto = require('crypto');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock environment variables
process.env.PHONEPE_MERCHANT_ID = 'PGTESTPAYUAT86';
process.env.PHONEPE_SALT_KEY = '96434309-7796-489d-8924-ab56988a6076';
process.env.PHONEPE_SALT_INDEX = '1';
process.env.PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
process.env.PHONEPE_REDIRECT_URL = 'http://localhost:3000/payment/success';

const PhonePeService = require('../../services/phonepeService');

describe('PhonePeService', () => {
  let phonepeService;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create new instance for each test
    phonepeService = new (require('../../services/phonepeService').constructor || class {
      constructor() {
        this.merchantId = process.env.PHONEPE_MERCHANT_ID;
        this.saltKey = process.env.PHONEPE_SALT_KEY;
        this.saltIndex = process.env.PHONEPE_SALT_INDEX;
        this.baseUrl = process.env.PHONEPE_BASE_URL;
        this.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
      }
      
      generateSHA256(payload) {
        return crypto.createHash('sha256').update(payload).digest('hex');
      }
      
      generateXVerify(base64Payload) {
        const sha256Hash = this.generateSHA256(base64Payload + '/pg/v1/pay' + this.saltKey);
        return sha256Hash + '###' + this.saltIndex;
      }
      
      async createPaymentRequest(paymentData) {
        const { amount, userId, planType, duration, userInfo } = paymentData;
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const payload = {
          merchantId: this.merchantId,
          merchantTransactionId: transactionId,
          merchantUserId: userId,
          amount: amount * 100,
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
      }
      
      async verifyPayment(transactionId) {
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
      }
    })();
  });

  describe('generateSHA256', () => {
    test('should generate correct SHA256 hash', () => {
      const input = 'test string';
      const expectedHash = crypto.createHash('sha256').update(input).digest('hex');
      const result = phonepeService.generateSHA256(input);
      
      expect(result).toBe(expectedHash);
      expect(result).toHaveLength(64); // SHA256 produces 64-character hex string
    });

    test('should generate different hashes for different inputs', () => {
      const hash1 = phonepeService.generateSHA256('input1');
      const hash2 = phonepeService.generateSHA256('input2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateXVerify', () => {
    test('should generate correct X-VERIFY header format', () => {
      const base64Payload = 'dGVzdCBwYXlsb2Fk'; // base64 for "test payload"
      const result = phonepeService.generateXVerify(base64Payload);
      
      expect(result).toMatch(/^[a-f0-9]{64}###1$/);
      expect(result.split('###')).toHaveLength(2);
      expect(result.endsWith('###1')).toBe(true);
    });

    test('should include endpoint path in hash calculation', () => {
      const base64Payload = 'dGVzdA==';
      const expectedString = base64Payload + '/pg/v1/pay' + phonepeService.saltKey;
      const expectedHash = crypto.createHash('sha256').update(expectedString).digest('hex');
      
      const result = phonepeService.generateXVerify(base64Payload);
      
      expect(result).toBe(expectedHash + '###1');
    });
  });

  describe('createPaymentRequest', () => {
    test('should create payment request successfully', async () => {
      // Mock successful response
      const mockResponse = {
        data: {
          success: true,
          data: {
            merchantTransactionId: 'TXN_123456',
            instrumentResponse: {
              redirectInfo: {
                url: 'https://mercury-uat.phonepe.com/transact/simulator?token=test'
              }
            }
          }
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const paymentData = {
        amount: 100,
        userId: 'user123',
        planType: 'Premium',
        duration: '1 month',
        userInfo: {
          phone: '9876543210'
        }
      };

      const result = await phonepeService.createPaymentRequest(paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
      expect(result.paymentUrl).toBe('https://mercury-uat.phonepe.com/transact/simulator?token=test');
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    test('should handle missing payment URL in response', async () => {
      // Mock response without payment URL
      const mockResponse = {
        data: {
          success: true,
          data: {}
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const paymentData = {
        amount: 100,
        userId: 'user123',
        planType: 'Premium',
        duration: '1 month',
        userInfo: {
          phone: '9876543210'
        }
      };

      const result = await phonepeService.createPaymentRequest(paymentData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment URL not received from PhonePe');
    });

    test('should convert amount to paise correctly', async () => {
      const mockResponse = {
        data: {
          data: {
            instrumentResponse: {
              redirectInfo: {
                url: 'https://test-url.com'
              }
            }
          }
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const paymentData = {
        amount: 100, // ₹100
        userId: 'user123',
        planType: 'Premium',
        duration: '1 month',
        userInfo: {}
      };

      await phonepeService.createPaymentRequest(paymentData);

      const callArgs = mockedAxios.post.mock.calls[0];
      const requestPayload = JSON.parse(Buffer.from(callArgs[1].request, 'base64').toString());
      
      expect(requestPayload.amount).toBe(10000); // ₹100 = 10000 paise
    });

    test('should include all required payload fields', async () => {
      const mockResponse = {
        data: {
          data: {
            instrumentResponse: {
              redirectInfo: {
                url: 'https://test-url.com'
              }
            }
          }
        }
      };
      
      mockedAxios.post.mockResolvedValue(mockResponse);

      const paymentData = {
        amount: 100,
        userId: 'user123',
        planType: 'Premium',
        duration: '1 month',
        userInfo: {
          phone: '9876543210'
        }
      };

      await phonepeService.createPaymentRequest(paymentData);

      const callArgs = mockedAxios.post.mock.calls[0];
      const requestPayload = JSON.parse(Buffer.from(callArgs[1].request, 'base64').toString());
      
      expect(requestPayload).toMatchObject({
        merchantId: 'PGTESTPAYUAT86',
        merchantUserId: 'user123',
        amount: 10000,
        redirectMode: 'POST',
        mobileNumber: '9876543210',
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      });
      
      expect(requestPayload.merchantTransactionId).toBeDefined();
      expect(requestPayload.redirectUrl).toBeDefined();
      expect(requestPayload.callbackUrl).toBeDefined();
    });
  });

  describe('verifyPayment', () => {
    test('should verify payment successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            merchantTransactionId: 'TXN_123456',
            state: 'COMPLETED',
            responseCode: 'SUCCESS'
          }
        }
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await phonepeService.verifyPayment('TXN_123456');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('should call correct endpoint with proper headers', async () => {
      const mockResponse = {
        data: { success: true }
      };
      
      mockedAxios.get.mockResolvedValue(mockResponse);

      await phonepeService.verifyPayment('TXN_123456');

      const callArgs = mockedAxios.get.mock.calls[0];
      const url = callArgs[0];
      const config = callArgs[1];
      
      expect(url).toBe('https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/PGTESTPAYUAT86/TXN_123456');
      expect(config.headers['Content-Type']).toBe('application/json');
      expect(config.headers['X-VERIFY']).toMatch(/^[a-f0-9]{64}###1$/);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors in createPaymentRequest', async () => {
      const paymentData = {
        amount: 100,
        userId: 'user123',
        planType: 'Premium',
        duration: '1 month',
        userInfo: {
          phone: '9876543210'
        }
      };

      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      const result = await phonepeService.createPaymentRequest(paymentData);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    test('should handle network errors in verifyPayment', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await phonepeService.verifyPayment('TXN_123456');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
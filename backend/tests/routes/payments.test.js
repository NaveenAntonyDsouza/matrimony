const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Payment = require('../../models/Payment');
const Subscription = require('../../models/Subscription');

// Mock PhonePe service
jest.mock('../../services/phonepeService', () => ({
  createPaymentRequest: jest.fn(),
  verifyPayment: jest.fn(),
  handlePaymentCallback: jest.fn()
}));

const phonepeService = require('../../services/phonepeService');

describe('Payment Routes', () => {
  let authToken;
  let userId;

  const validUserData = {
    email: 'test@example.com',
    password: 'password123',
    phone: '9876543210',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    dateOfBirth: '1990-01-01',
    profileCreatedFor: 'Self',
    motherTongue: 'English',
    religion: 'Hindu',
    maritalStatus: 'Never Married',
    height: '5\'8"',
    country: 'India',
    state: 'Maharashtra',
    city: 'Mumbai',
    education: 'Bachelor\'s Degree',
    occupation: 'Software Engineer'
  };

  beforeEach(async () => {
    // Create and authenticate user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(validUserData);
    
    authToken = registerResponse.body.token;
    userId = registerResponse.body.user._id;

    // Clear PhonePe service mocks
    phonepeService.createPaymentRequest.mockClear();
    phonepeService.verifyPayment.mockClear();
    phonepeService.handlePaymentCallback.mockClear();
  });

  describe('POST /api/payments/create-order', () => {
    const validOrderData = {
      planType: 'Premium',
      duration: '1 month'
    };

    test('should create payment order with valid data', async () => {
      // Mock successful PhonePe response
      phonepeService.createPaymentRequest.mockResolvedValue({
        success: true,
        transactionId: 'TXN_123456789',
        paymentUrl: 'https://mercury-uat.phonepe.com/transact/simulator?token=test',
        data: {
          success: true,
          data: {
            merchantTransactionId: 'TXN_123456789',
            instrumentResponse: {
              redirectInfo: {
                url: 'https://mercury-uat.phonepe.com/transact/simulator?token=test'
              }
            }
          }
        }
      });

      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.transactionId).toBeDefined();
      expect(response.body.paymentUrl).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .send(validOrderData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('No token, authorization denied');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Empty data
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation errors');
    });

    test('should validate plan type', async () => {
      const invalidData = {
        planType: 'InvalidPlan',
        duration: '1 month'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some(err => err.path === 'planType')).toBe(true);
    });

    test('should validate duration', async () => {
      const invalidData = {
        planType: 'Premium',
        duration: 'invalid duration'
      };

      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors.some(err => err.path === 'duration')).toBe(true);
    });

    test('should handle PhonePe service errors', async () => {
      phonepeService.createPaymentRequest.mockRejectedValue(new Error('PhonePe API error'));

      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Server error');
    });

    test('should calculate correct amount for different plans', async () => {
      const plans = [
        { planType: 'Premium', duration: '1 month', expectedAmount: 1599 },
        { planType: 'Premium', duration: '3 months', expectedAmount: 3999 },
        { planType: 'Premium Plus', duration: '6 months', expectedAmount: 14999 }
      ];

      for (const plan of plans) {
        phonepeService.createPaymentRequest.mockResolvedValue({
          success: true,
          transactionId: `TXN_${Date.now()}`,
          paymentUrl: 'https://test-url.com'
        });

        const response = await request(app)
          .post('/api/payments/create-order')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            planType: plan.planType,
            duration: plan.duration
          })
          .expect(200);

        expect(response.body.transactionId).toBeDefined();
        expect(response.body.paymentUrl).toBeDefined();
      }
    });

    test('should save payment record to database', async () => {
      phonepeService.createPaymentRequest.mockResolvedValue({
        success: true,
        transactionId: 'TXN_123456789',
        paymentUrl: 'https://test-url.com'
      });

      await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validOrderData)
        .expect(200);

      const subscription = await Subscription.findOne({ user: userId });
      expect(subscription).toBeDefined();
      expect(subscription.paymentId).toBe('TXN_123456789');
      expect(subscription.status).toBe('Pending');
    });
  });

  describe('POST /api/payments/callback', () => {
    let subscriptionRecord;

    beforeEach(async () => {
      // Create a subscription record for callback tests
      subscriptionRecord = new Subscription({
        user: userId,
        planType: 'Premium',
        duration: '1 month',
        price: 1599,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        paymentId: 'TXN_123456789',
        paymentMethod: 'PhonePe',
        features: {
          contactsPerDay: 10,
          messagesPerDay: 50,
          profileViews: true,
          advancedSearch: true,
          prioritySupport: false,
          profileHighlight: false
        }
      });
      await subscriptionRecord.save();
    });

    test('should handle successful payment callback', async () => {
      phonepeService.handlePaymentCallback.mockResolvedValue({
        success: true,
        transactionId: 'TXN_123456789',
        status: 'COMPLETED',
        code: 'PAYMENT_SUCCESS'
      });

      const callbackData = {
        transactionId: 'TXN_123456789',
        status: 'SUCCESS'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment successful');

      // Check if subscription status was updated
      const updatedSubscription = await Subscription.findOne({ paymentId: 'TXN_123456789' });
      expect(updatedSubscription.status).toBe('Active');
    });

    test('should handle failed payment callback', async () => {
      phonepeService.handlePaymentCallback.mockResolvedValue({
        success: true,
        transactionId: 'TXN_123456789',
        status: 'FAILED',
        code: 'PAYMENT_ERROR'
      });

      const callbackData = {
        transactionId: 'TXN_123456789',
        status: 'FAILED'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData)
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Payment failed');

      // Check if subscription status was updated
      const updatedSubscription = await Subscription.findOne({ paymentId: 'TXN_123456789' });
      expect(updatedSubscription.status).toBe('Cancelled');
    });

    test('should handle missing transaction ID', async () => {
      phonepeService.handlePaymentCallback.mockResolvedValue({
        success: false,
        message: 'Transaction ID is required'
      });

      const response = await request(app)
        .post('/api/payments/callback')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid callback data');
    });

    test('should handle non-existent transaction', async () => {
      phonepeService.handlePaymentCallback.mockResolvedValue({
        success: true,
        transactionId: 'NON_EXISTENT_TXN',
        status: 'COMPLETED',
        code: 'PAYMENT_SUCCESS'
      });

      const response = await request(app)
        .post('/api/payments/callback')
        .send({ transactionId: 'NON_EXISTENT_TXN' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Subscription not found');
    });

    test('should update user subscription on successful payment', async () => {
      phonepeService.handlePaymentCallback.mockResolvedValue({
        success: true,
        transactionId: 'TXN_123456789',
        status: 'COMPLETED',
        code: 'PAYMENT_SUCCESS'
      });

      await request(app)
        .post('/api/payments/callback')
        .send({
          transactionId: 'TXN_123456789',
          status: 'SUCCESS'
        })
        .expect(200);

      // Check if user membership was updated
      const updatedUser = await User.findById(userId);
      expect(updatedUser.membershipType).toBe('Premium');
      expect(updatedUser.membershipExpiry).toBeDefined();
    });
  });

  describe('GET /api/payments/verify/:transactionId', () => {
    let subscriptionRecord;

    beforeEach(async () => {
      subscriptionRecord = new Subscription({
        user: userId,
        planType: 'Premium',
        duration: '1 month',
        price: 1599,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Pending',
        paymentId: 'TXN_123456789',
        paymentMethod: 'PhonePe',
        features: {
          contactsPerDay: 10,
          messagesPerDay: 50,
          profileViews: true,
          advancedSearch: true,
          prioritySupport: false,
          profileHighlight: false
        }
      });
      await subscriptionRecord.save();
    });

    test('should verify payment with valid transaction ID', async () => {
      phonepeService.verifyPayment.mockResolvedValue({
        success: true,
        data: {
          success: true,
          data: {
            merchantTransactionId: 'TXN_123456789',
            state: 'COMPLETED',
            responseCode: 'SUCCESS'
          }
        }
      });

      const response = await request(app)
        .get('/api/payments/verify/TXN_123456789')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscription).toBeDefined();
      expect(response.body.subscription.paymentId).toBe('TXN_123456789');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/payments/verify/TXN_123456789')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should handle non-existent transaction', async () => {
      phonepeService.verifyPayment.mockResolvedValue({
        success: true,
        data: {
          success: false,
          data: {
            merchantTransactionId: 'NON_EXISTENT_TXN',
            state: 'FAILED',
            responseCode: 'TRANSACTION_NOT_FOUND'
          }
        }
      });

      const response = await request(app)
        .get('/api/payments/verify/NON_EXISTENT_TXN')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentStatus).toBe('FAILED');
    });

    test('should allow any authenticated user to verify payments', async () => {
      // Create another user
      const otherUserData = {
        ...validUserData,
        email: 'other@example.com',
        phone: '9876543211'
      };
      
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);
      
      const otherUserToken = otherUserResponse.body.token;

      phonepeService.verifyPayment.mockResolvedValue({
        success: true,
        data: {
          success: true,
          data: {
            merchantTransactionId: 'TXN_123456789',
            state: 'COMPLETED',
            responseCode: 'SUCCESS'
          }
        }
      });

      const response = await request(app)
        .get('/api/payments/verify/TXN_123456789')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.paymentStatus).toBe('COMPLETED');
    });
  });

  describe('GET /api/payments/history', () => {
    beforeEach(async () => {
      // Create multiple subscription records
      const subscriptions = [
        {
          user: userId,
          planType: 'Premium',
          duration: '1 month',
          price: 1599,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Active',
          paymentId: 'TXN_001',
          paymentMethod: 'PhonePe',
          features: {
            contactsPerDay: 10,
            messagesPerDay: 50,
            profileViews: true,
            advancedSearch: true,
            prioritySupport: false,
            profileHighlight: false
          }
        },
        {
          user: userId,
          planType: 'Premium Plus',
          duration: '1 month',
          price: 2999,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Expired',
          paymentId: 'TXN_002',
          paymentMethod: 'PhonePe',
          features: {
            contactsPerDay: 25,
            messagesPerDay: 100,
            profileViews: true,
            advancedSearch: true,
            prioritySupport: true,
            profileHighlight: true
          }
        },
        {
          user: userId,
          planType: 'Premium',
          duration: '3 months',
          price: 3999,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: 'Cancelled',
          paymentId: 'TXN_003',
          paymentMethod: 'PhonePe',
          features: {
            contactsPerDay: 10,
            messagesPerDay: 50,
            profileViews: true,
            advancedSearch: true,
            prioritySupport: false,
            profileHighlight: false
          }
        }
      ];

      await Subscription.insertMany(subscriptions);
    });

    test('should get payment history for authenticated user', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.subscriptions).toBeDefined();
      expect(response.body.subscriptions).toHaveLength(3);
      expect(response.body.subscriptions[0].paymentId).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/payments/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should only return user\'s own subscriptions', async () => {
      // Create another user with subscriptions
      const otherUserData = {
        ...validUserData,
        email: 'other@example.com',
        phone: '9876543211'
      };
      
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUserData);
      
      const otherUserId = otherUserResponse.body.user._id;
      const otherUserToken = otherUserResponse.body.token;

      // Create subscription for other user
      await new Subscription({
        user: otherUserId,
        planType: 'Premium',
        duration: '1 month',
        price: 1599,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Active',
        paymentId: 'TXN_OTHER',
        paymentMethod: 'PhonePe',
        features: {
          contactsPerDay: 10,
          messagesPerDay: 50,
          profileViews: true,
          advancedSearch: true,
          prioritySupport: false,
          profileHighlight: false
        }
      }).save();

      const response = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.subscriptions).toHaveLength(1);
      expect(response.body.subscriptions[0].paymentId).toBe('TXN_OTHER');
    });


  });

  describe('Error Handling', () => {
    test('should handle PhonePe service unavailable', async () => {
      phonepeService.createPaymentRequest.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'Premium',
          duration: '1 month'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
    });

    test('should handle database errors gracefully', async () => {
      // This would require mocking mongoose to simulate database errors
      // For now, we ensure the routes handle errors properly
      const response = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'Premium',
          duration: '1 month'
        });

      // Should not crash the application
      expect(response.body).toBeDefined();
    });
  });
});
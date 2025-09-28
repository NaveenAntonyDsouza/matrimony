const express = require('express');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const phonepeService = require('../services/phonepeService');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/payments/create-order
// @desc    Create PhonePe payment order
// @access  Private
router.post('/create-order', [
  auth,
  body('planType').isIn(['Premium', 'Premium Plus']),
  body('duration').isIn(['1 month', '3 months', '6 months', '12 months'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { planType, duration } = req.body;

    // Calculate price based on plan and duration
    const priceMap = {
      'Premium-1 month': 1599,
      'Premium-3 months': 3999,
      'Premium-6 months': 7999,
      'Premium-12 months': 14999,
      'Premium Plus-1 month': 2999,
      'Premium Plus-3 months': 7999,
      'Premium Plus-6 months': 14999,
      'Premium Plus-12 months': 24999
    };

    const amount = priceMap[`${planType}-${duration}`];
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan or duration'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: req.user.id,
      status: 'Active'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    // Create payment request
    const paymentData = {
      amount,
      userId: req.user.id,
      planType,
      duration,
      userInfo: {
        phone: req.user.phone,
        email: req.user.email,
        name: `${req.user.firstName} ${req.user.lastName}`
      }
    };

    const paymentResult = await phonepeService.createPaymentRequest(paymentData);

    if (!paymentResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment request',
        error: paymentResult.error
      });
    }

    // Store pending subscription
    const pendingSubscription = new Subscription({
      user: req.user.id,
      planType,
      duration,
      price: amount,
      paymentId: paymentResult.transactionId,
      paymentMethod: 'PhonePe',
      status: 'Pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Temporary end date
      features: planType === 'Premium' ? {
        contactsPerDay: 10,
        messagesPerDay: 50,
        profileViews: true,
        advancedSearch: true,
        prioritySupport: false,
        profileHighlight: false
      } : {
        contactsPerDay: 25,
        messagesPerDay: 100,
        profileViews: true,
        advancedSearch: true,
        prioritySupport: true,
        profileHighlight: true
      }
    });

    await pendingSubscription.save();

    res.json({
      success: true,
      message: 'Payment order created successfully',
      paymentUrl: paymentResult.paymentUrl,
      transactionId: paymentResult.transactionId
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/payments/callback
// @desc    Handle PhonePe payment callback
// @access  Public
router.post('/callback', async (req, res) => {
  try {
    const callbackResult = await phonepeService.handlePaymentCallback(req.body);
    
    if (!callbackResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid callback data'
      });
    }

    const { transactionId, status, code } = callbackResult;

    // Find the pending subscription
    const subscription = await Subscription.findOne({
      paymentId: transactionId,
      status: 'Pending'
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (status === 'COMPLETED' && code === 'PAYMENT_SUCCESS') {
      // Payment successful - activate subscription
      const startDate = new Date();
      const endDate = new Date(startDate);
      const durationMonths = parseInt(subscription.duration.split(' ')[0]);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      subscription.status = 'Active';
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      await subscription.save();

      // Update user membership
      await User.findByIdAndUpdate(subscription.user, {
        membershipType: subscription.planType,
        membershipExpiry: endDate
      });

      return res.json({
        success: true,
        message: 'Payment successful',
        subscription
      });
    } else {
      // Payment failed
      subscription.status = 'Cancelled';
      await subscription.save();

      return res.json({
        success: false,
        message: 'Payment failed',
        status,
        code
      });
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/verify/:transactionId
// @desc    Verify payment status
// @access  Private
router.get('/verify/:transactionId', auth, async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Verify with PhonePe
    const verificationResult = await phonepeService.verifyPayment(transactionId);

    if (!verificationResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: verificationResult.error
      });
    }

    const { data } = verificationResult;
    const paymentData = data.data;

    // Update subscription based on verification
    const subscription = await Subscription.findOne({
      paymentId: transactionId
    });

    if (subscription) {
      if (paymentData.state === 'COMPLETED' && paymentData.code === 'PAYMENT_SUCCESS') {
        subscription.status = 'Active';
        await subscription.save();

        // Update user membership
        await User.findByIdAndUpdate(subscription.user, {
          membershipType: subscription.planType,
          membershipExpiry: subscription.endDate
        });
      } else {
        subscription.status = 'Cancelled';
        await subscription.save();
      }
    }

    res.json({
      success: true,
      paymentStatus: paymentData.state,
      code: paymentData.code,
      subscription
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/payments/history
// @desc    Get user payment history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;


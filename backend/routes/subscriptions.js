const express = require('express');
const { auth } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/subscriptions/plans
// @desc    Get available subscription plans
// @access  Public
router.get('/plans', (req, res) => {
  const plans = [
    {
      type: 'Premium',
      duration: '1 month',
      price: 1599,
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
      type: 'Premium',
      duration: '3 months',
      price: 3999,
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
      type: 'Premium Plus',
      duration: '1 month',
      price: 2999,
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
      type: 'Premium Plus',
      duration: '6 months',
      price: 14999,
      features: {
        contactsPerDay: 25,
        messagesPerDay: 100,
        profileViews: true,
        advancedSearch: true,
        prioritySupport: true,
        profileHighlight: true
      }
    }
  ];

  res.json({
    success: true,
    plans
  });
});

// @route   POST /api/subscriptions/create
// @desc    Create a new subscription
// @access  Private
router.post('/create', auth, async (req, res) => {
  try {
    const { planType, duration, paymentId, paymentMethod } = req.body;

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

    const price = priceMap[`${planType}-${duration}`];
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan or duration'
      });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    const durationMonths = parseInt(duration.split(' ')[0]);
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // Create subscription
    const subscription = new Subscription({
      user: req.user.id,
      planType,
      duration,
      price,
      startDate,
      endDate,
      paymentId,
      paymentMethod,
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

    await subscription.save();

    // Update user membership
    await User.findByIdAndUpdate(req.user.id, {
      membershipType: planType,
      membershipExpiry: endDate
    });

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/subscriptions/current
// @desc    Get current user subscription
// @access  Private
router.get('/current', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user.id,
      status: 'Active'
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
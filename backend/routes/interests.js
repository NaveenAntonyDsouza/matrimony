const express = require('express');
const { auth } = require('../middleware/auth');
const Interest = require('../models/Interest');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/interests
// @desc    Express interest in a profile
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { toUser, interestType, message } = req.body;

    // Check if interest already exists
    const existingInterest = await Interest.findOne({
      fromUser: req.user.id,
      toUser
    });

    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'Interest already expressed'
      });
    }

    const interest = new Interest({
      fromUser: req.user.id,
      toUser,
      interestType,
      message
    });

    await interest.save();

    res.status(201).json({
      success: true,
      message: 'Interest expressed successfully',
      interest
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/interests/received
// @desc    Get received interests
// @access  Private
router.get('/received', auth, async (req, res) => {
  try {
    const interests = await Interest.find({ toUser: req.user.id })
      .populate('fromUser', 'firstName lastName photos occupation city state membershipType lastActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      interests
    });
  } catch (error) {
    console.error('Get received interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/interests/sent
// @desc    Get sent interests
// @access  Private
router.get('/sent', auth, async (req, res) => {
  try {
    const interests = await Interest.find({ fromUser: req.user.id })
      .populate('toUser', 'firstName lastName photos occupation city state membershipType lastActive')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      interests
    });
  } catch (error) {
    console.error('Get sent interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/interests/:id/respond
// @desc    Respond to an interest
// @access  Private
router.put('/:id/respond', auth, async (req, res) => {
  try {
    const { status } = req.body; // 'Accepted' or 'Declined'

    const interest = await Interest.findOneAndUpdate(
      { _id: req.params.id, toUser: req.user.id },
      { 
        status,
        respondedAt: new Date()
      },
      { new: true }
    );

    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    res.json({
      success: true,
      message: `Interest ${status.toLowerCase()} successfully`,
      interest
    });
  } catch (error) {
    console.error('Respond to interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
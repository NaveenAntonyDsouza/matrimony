const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const ProfileView = require('../models/ProfileView');

const router = express.Router();

// @route   GET /api/profiles/:id
// @desc    Get profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await User.findById(req.params.id).select('-password -email -phone');
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Log profile view
    const existingView = await ProfileView.findOne({
      viewer: req.user.id,
      viewedProfile: req.params.id
    });

    if (!existingView) {
      await ProfileView.create({
        viewer: req.user.id,
        viewedProfile: req.params.id
      });

      // Increment profile views count
      await User.findByIdAndUpdate(req.params.id, {
        $inc: { profileViews: 1 }
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
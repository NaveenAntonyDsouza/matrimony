const express = require('express');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/search
// @desc    Search profiles
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      ageFrom,
      ageTo,
      religion,
      motherTongue,
      education,
      occupation,
      city,
      state,
      country,
      maritalStatus,
      heightFrom,
      heightTo,
      page = 1,
      limit = 20
    } = req.body;

    // Build search query
    const searchQuery = {
      _id: { $ne: req.user.id }, // Exclude current user
      gender: req.user.gender === 'Male' ? 'Female' : 'Male', // Opposite gender
    };

    // Age filter
    if (ageFrom || ageTo) {
      const today = new Date();
      const dateQuery = {};
      
      if (ageTo) {
        const minDate = new Date(today.getFullYear() - ageTo - 1, today.getMonth(), today.getDate());
        dateQuery.$gte = minDate;
      }
      
      if (ageFrom) {
        const maxDate = new Date(today.getFullYear() - ageFrom, today.getMonth(), today.getDate());
        dateQuery.$lte = maxDate;
      }
      
      if (Object.keys(dateQuery).length > 0) {
        searchQuery.dateOfBirth = dateQuery;
      }
    }

    // Other filters
    if (religion) searchQuery.religion = religion;
    if (motherTongue) searchQuery.motherTongue = motherTongue;
    if (education) searchQuery.education = new RegExp(education, 'i');
    if (occupation) searchQuery.occupation = new RegExp(occupation, 'i');
    if (city) searchQuery.city = new RegExp(city, 'i');
    if (state) searchQuery.state = new RegExp(state, 'i');
    if (country) searchQuery.country = country;
    if (maritalStatus) searchQuery.maritalStatus = maritalStatus;

    const skip = (page - 1) * limit;

    const profiles = await User.find(searchQuery)
      .select('-password -email -phone -blockedUsers -reportedUsers')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
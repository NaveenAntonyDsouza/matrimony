const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// @route   POST /api/upload/photo
// @desc    Upload profile photo
// @access  Private
router.post('/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    const isProfile = req.body.isProfile === 'true';

    // Add photo to user's photos array
    const user = await User.findById(req.user.id);
    
    // If this is set as profile photo, remove profile flag from other photos
    if (isProfile) {
      user.photos.forEach(photo => {
        photo.isProfile = false;
      });
    }

    user.photos.push({
      url: photoUrl,
      isProfile: isProfile,
      uploadedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/upload/photo/:photoId
// @desc    Delete a photo
// @access  Private
router.delete('/photo/:photoId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Find and remove the photo
    const photoIndex = user.photos.findIndex(
      photo => photo._id.toString() === req.params.photoId
    );

    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    user.photos.splice(photoIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
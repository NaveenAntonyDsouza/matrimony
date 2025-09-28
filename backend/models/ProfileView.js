const mongoose = require('mongoose');

const profileViewSchema = new mongoose.Schema({
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewedProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewType: {
    type: String,
    enum: ['profile_visit', 'photo_view', 'contact_view'],
    default: 'profile_visit'
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to track unique views
profileViewSchema.index({ viewer: 1, viewedProfile: 1, viewType: 1 });
profileViewSchema.index({ viewedProfile: 1, viewedAt: -1 });

module.exports = mongoose.model('ProfileView', profileViewSchema);
const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interestType: {
    type: String,
    enum: ['Express Interest', 'Send Message', 'Send Photo Request', 'Accept Interest', 'Decline Interest'],
    required: true
  },
  message: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['Sent', 'Accepted', 'Declined', 'Withdrawn'],
    default: 'Sent'
  },
  viewedAt: {
    type: Date
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate interests
interestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
interestSchema.index({ toUser: 1, status: 1 });
interestSchema.index({ fromUser: 1, status: 1 });

module.exports = mongoose.model('Interest', interestSchema);
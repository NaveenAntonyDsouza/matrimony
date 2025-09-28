const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planType: {
    type: String,
    enum: ['Premium', 'Premium Plus'],
    required: true
  },
  duration: {
    type: String,
    enum: ['1 month', '3 months', '6 months', '12 months'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Expired', 'Cancelled', 'Failed'],
    default: 'Pending'
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'Wallet', 'PhonePe'],
    required: true
  },
  autoRenewal: {
    type: Boolean,
    default: false
  },
  features: {
    contactsPerDay: {
      type: Number,
      default: 0
    },
    messagesPerDay: {
      type: Number,
      default: 0
    },
    profileViews: {
      type: Boolean,
      default: false
    },
    advancedSearch: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    profileHighlight: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
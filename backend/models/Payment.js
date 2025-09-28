const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  planType: {
    type: String,
    enum: ['Basic', 'Premium', 'Gold'],
    required: true
  },
  duration: {
    type: String,
    enum: ['1 month', '3 months', '6 months', '12 months'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'PhonePe'
  },
  phonepeTransactionId: {
    type: String
  },
  phonepeResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  failureReason: {
    type: String
  },
  refundId: {
    type: String
  },
  refundAmount: {
    type: Number
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Index for efficient queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
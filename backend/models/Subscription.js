import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay'],
    default: 'razorpay'
  },
  transactionId: {
    type: String,
    required: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ createdAt: -1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;


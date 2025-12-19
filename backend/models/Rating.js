import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reply: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure one rating per user
ratingSchema.index({ user: 1 }, { unique: true });
ratingSchema.index({ createdAt: -1 });
ratingSchema.index({ rating: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;


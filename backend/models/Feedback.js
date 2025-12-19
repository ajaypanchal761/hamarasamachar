import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['App Feedback', 'News Feedback'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['New', 'Read', 'Resolved'],
    default: 'New'
  }
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;


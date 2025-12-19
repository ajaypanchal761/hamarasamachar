import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  replies: [{
    text: {
      type: String,
      required: true
    },
    user: {
      name: String,
      role: String
    },
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ news: 1, status: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;


import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['breaking_news', 'new_news', 'new_epaper', 'custom', 'category_news', 'subscription_reminder'],
    required: true
  },
  data: {
    newsId: String,
    epaperId: String,
    category: String,
    url: String,
    priority: {
      type: String,
      enum: ['high', 'normal', 'low'],
      default: 'normal'
    }
  },
  isRead: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  readAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, sentAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Notification', notificationSchema);

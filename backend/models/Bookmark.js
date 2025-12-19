import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  }
}, {
  timestamps: true
});

// Ensure one bookmark per user-news combination
bookmarkSchema.index({ user: 1, news: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;


import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  link: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    enum: ['homepage_top', 'sidebar', 'category_top', 'news_detail', 'news_feed', 'homepage_middle', 'category_page'],
    required: true
  },
  category: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  target: {
    type: String,
    enum: ['_blank', '_self'],
    default: '_self'
  },
  clicks: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
bannerSchema.index({ position: 1, status: 1 });
bannerSchema.index({ category: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

export default Banner;


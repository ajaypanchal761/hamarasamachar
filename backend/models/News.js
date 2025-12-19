import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  sequentialId: {
    type: Number,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  district: {
    type: String,
    trim: true
  },
  featuredImage: {
    type: String,
    trim: true
  },
  videoUrl: {
    type: String,
    trim: true
  },
  isBreakingNews: {
    type: Boolean,
    default: false
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  metaDescription: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Auto-generate sequentialId and slug before save
newsSchema.pre('save', async function(next) {
  // Generate sequentialId if new document (must be done first)
  if (this.isNew && !this.sequentialId) {
    try {
      const Counter = (await import('./Counter.js')).default;
      const counter = await Counter.findByIdAndUpdate(
        'newsId',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.sequentialId = counter.seq;
    } catch (error) {
      return next(error);
    }
  }

  // Generate slug from title (after sequentialId is set)
  if (this.isModified('title') && !this.slug) {
    if (!this.title || this.title.trim() === '') {
      // If title is empty, use sequentialId or _id as fallback
      this.slug = `news-${this.sequentialId || this._id || Date.now()}`;
    } else {
      let generatedSlug = this.title.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters (keeps alphanumeric, spaces, dashes)
        .replace(/\s+/g, '-') // Replace spaces with dash
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
        .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
        .trim();
      
      // If slug is empty or just dashes after processing, use fallback
      if (!generatedSlug || generatedSlug === '-' || generatedSlug === '') {
        generatedSlug = `news-${this.sequentialId || this._id || Date.now()}`;
      }
      
      this.slug = generatedSlug;
    }
    
    // Ensure slug is unique by checking database and appending number if needed
    if (this.isNew && this.slug) {
      try {
        const NewsModel = mongoose.model('News');
        let finalSlug = this.slug;
        let counter = 1;
        
        // Check if slug exists, if yes append number
        while (await NewsModel.findOne({ slug: finalSlug })) {
          finalSlug = `${this.slug}-${counter}`;
          counter++;
          // Safety limit to prevent infinite loop
          if (counter > 1000) {
            finalSlug = `${this.slug}-${Date.now()}`;
            break;
          }
        }
        
        this.slug = finalSlug;
      } catch (error) {
        // If error checking, append timestamp to ensure uniqueness
        this.slug = `${this.slug}-${Date.now()}`;
      }
    }
  }
  next();
});

// Indexes for faster queries
// Note: slug already has index from unique: true
newsSchema.index({ category: 1, status: 1 });
newsSchema.index({ district: 1 });
newsSchema.index({ isBreakingNews: 1, status: 1 });
newsSchema.index({ publishDate: -1 });
newsSchema.index({ views: -1 });

const News = mongoose.model('News', newsSchema);

export default News;


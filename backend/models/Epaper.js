import mongoose from 'mongoose';

const epaperSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  pdfUrl: {
    type: String,
    required: true
  },
  coverUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
epaperSchema.index({ date: -1 });

const Epaper = mongoose.model('Epaper', epaperSchema);

export default Epaper;


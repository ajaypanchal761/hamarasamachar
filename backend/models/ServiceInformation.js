import mongoose from 'mongoose';

const serviceInformationSchema = new mongoose.Schema({
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  sentToAll: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
serviceInformationSchema.index({ createdAt: -1 });
serviceInformationSchema.index({ createdBy: 1 });

const ServiceInformation = mongoose.model('ServiceInformation', serviceInformationSchema);

export default ServiceInformation;

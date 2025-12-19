import mongoose from 'mongoose';

const franchiseLeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'closed'],
    default: 'new'
  },
  source: {
    type: String,
    default: 'franchise_page',
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  age: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
franchiseLeadSchema.index({ status: 1 });
franchiseLeadSchema.index({ createdAt: -1 });
franchiseLeadSchema.index({ phone: 1 });

const FranchiseLead = mongoose.model('FranchiseLead', franchiseLeadSchema);

export default FranchiseLead;


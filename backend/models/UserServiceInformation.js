import mongoose from 'mongoose';

const userServiceInformationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceInformation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceInformation',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique user-serviceInformation pairs
userServiceInformationSchema.index({ user: 1, serviceInformation: 1 }, { unique: true });

const UserServiceInformation = mongoose.model('UserServiceInformation', userServiceInformationSchema);

export default UserServiceInformation;

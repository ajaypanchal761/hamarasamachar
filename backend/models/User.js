import mongoose from 'mongoose';

// Generate unique HS user ID
const generateUserId = async (UserModel) => {
  let userId;
  let exists = true;
  
  while (exists) {
    // Generate HS + 8 alphanumeric characters (uppercase)
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    userId = `HS${randomPart}`;
    
    // Check if ID already exists
    const existingUser = await UserModel.findOne({ userId });
    exists = !!existingUser;
  }
  
  return userId;
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    sparse: true, // Allow null values
    trim: true,
    uppercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  birthdate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Blocked'],
    default: 'Active'
  },
  selectedCategory: {
    type: String,
    trim: true
  },
  selectedCategories: {
    type: [String],
    default: []
  },
  selectedDistrict: {
    type: String,
    trim: true
  },
  selectedCity: {
    type: String,
    trim: true
  },
  otp: {
    code: String,
    expiresAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  stats: {
    bookmarks: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    }
  },
  notificationSettings: {
    pushNotifications: {
      type: Boolean,
      default: true
    },
    breakingNews: {
      type: Boolean,
      default: true
    },
    localNews: {
      type: Boolean,
      default: true
    },
    sportsNews: {
      type: Boolean,
      default: true
    },
    entertainmentNews: {
      type: Boolean,
      default: true
    }
  },
  subscription: {
    isActive: {
      type: Boolean,
      default: false
    },
    planType: {
      type: String,
      enum: ['monthly', 'yearly', null],
      default: null
    },
    expiryDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to generate userId if not exists
userSchema.pre('save', async function(next) {
  if (!this.userId && this.isNew) {
    const UserModel = this.constructor;
    this.userId = await generateUserId(UserModel);
  }
  next();
});

// Index for faster queries
// Note: phone and userId already have indexes from unique: true
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;


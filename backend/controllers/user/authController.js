import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import OTP from '../../models/OTP.js';
import { generateOTP } from '../../utils/otp.js';
import smsHubIndiaService from '../../services/smsHubIndiaService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Send OTP
// @route   POST /api/user/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    console.log('📨 Send OTP request received:', { phone: req.body.phone });

    const { phone, purpose = 'registration' } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone format
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number'
      });
    }

    // Generate OTP - Use default OTP for specific phone number
    let otp;
    if (normalizedPhone === '7610416911') {
      otp = '110211';
      console.log(`🔐 Using default OTP for ${normalizedPhone}: ${otp}`);
    } else {
      otp = generateOTP(6);
      console.log(`🔐 Generated OTP for ${normalizedPhone}`);
    }

    // Delete any existing OTPs for this phone
    await OTP.deleteMany({ phone: normalizedPhone, isVerified: false });

    // Create OTP record in database
    console.log('💾 Creating OTP record in database...');
    let otpRecord;
    try {
      otpRecord = await OTP.createOTP({
        otp,
        phone: normalizedPhone,
        purpose
      });
      console.log('✅ OTP record created:', otpRecord._id);
    } catch (dbError) {
      console.error('❌ Database error creating OTP:', dbError);
      throw new Error(`Failed to create OTP record: ${dbError.message}`);
    }

    let smsSent = false;
    let smsMessageId = null;

    // Skip SMS for specific phone number
    const skipSMSForNumber = normalizedPhone === '7610416911';
    
    if (skipSMSForNumber) {
      console.log(`⏭️ Skipping SMS for ${normalizedPhone} (default OTP number)`);
    } else {
      // Send OTP via SMS if SMS Hub India is configured
      if (smsHubIndiaService.isConfigured()) {
        try {
          console.log(`📱 Attempting to send SMS to ${normalizedPhone}...`);
          const smsResult = await smsHubIndiaService.sendOTP(normalizedPhone, otp, 'Hamara Samachar');
          if (smsResult.success) {
            smsSent = true;
            smsMessageId = smsResult.messageId;
            otpRecord.smsSent = true;
            otpRecord.smsMessageId = smsMessageId;
            await otpRecord.save();
            console.log(`✅ SMS OTP sent to ${normalizedPhone}, Message ID: ${smsMessageId}`);
          } else {
            console.warn('⚠️ SMS service returned unsuccessful:', smsResult);
          }
        } catch (smsError) {
          console.error('❌ SMS sending failed:', smsError.message);
          // Continue even if SMS fails - OTP is still stored in database
        }
      } else {
        console.warn('⚠️ SMS Hub India not configured. OTP will be shown in console for development.');
        // In development, log OTP to console
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 OTP for ${normalizedPhone}: ${otp}`);
        }
      }
    }

    // If SMS failed and we're in production, return error (but skip for default OTP number)
    if (!smsSent && process.env.NODE_ENV === 'production' && !skipSMSForNumber) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please check your contact details and try again.'
      });
    }

    res.json({
      success: true,
      message: smsSent ? 'OTP sent successfully via SMS' : 'OTP generated successfully',
      method: smsSent ? 'SMS' : 'Console',
      // Return OTP only in development mode if SMS not sent
      otp: (process.env.NODE_ENV === 'development' && !smsSent) ? otp : undefined
    });
  } catch (error) {
    console.error('❌ Send OTP error:', error);

    let errorMessage = 'Failed to send OTP. Please try again.';

    if (error.name === 'ValidationError') {
      errorMessage = error.message || 'Validation error. Please check your input.';
    } else if (error.message) {
      errorMessage = typeof error.message === 'string'
        ? error.message
        : 'An error occurred while sending OTP.';
    }

    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// @desc    Verify OTP and Login
// @route   POST /api/user/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, purpose = 'verification' } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP is required'
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Normalize phone
    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length > 10) {
      const phone10 = normalizedPhone.slice(-10);
    }

    // Find valid OTP from database
    let otpRecord = await OTP.findValidOTP(normalizedPhone, null, otp, purpose);

    if (!otpRecord) {
      // Try to find if OTP exists but is invalid
      const existingOTP = await OTP.findOne({
        phone: normalizedPhone,
        otp,
        purpose,
      });

      if (existingOTP) {
        if (existingOTP.isVerified) {
          return res.status(400).json({
            success: false,
            message: 'OTP has already been used'
          });
        }
        if (existingOTP.expiresAt <= new Date()) {
          return res.status(400).json({
            success: false,
            message: 'OTP has expired. Please request a new one.'
          });
        }
        if (existingOTP.attempts >= existingOTP.maxAttempts) {
          return res.status(400).json({
            success: false,
            message: 'Maximum verification attempts exceeded. Please request a new OTP.'
          });
        }
        // Increment attempts
        await existingOTP.incrementAttempts();
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await otpRecord.incrementAttempts();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please check and try again.'
      });
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();

    // Find or create user
    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      user = await User.create({
        phone: normalizedPhone,
        isVerified: true
      });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id);

    // Check if profile is complete (has gender and selectedCategory)
    const isProfileComplete = !!(user.gender && user.gender !== '' && user.selectedCategory);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.userId || user._id, // Use userId if available, fallback to _id
        userId: user.userId || user._id, // Explicit userId field
        phone: user.phone,
        name: user.name,
        gender: user.gender,
        birthdate: user.birthdate,
        selectedCategory: user.selectedCategory,
        selectedCategories: user.selectedCategories || [],
        selectedDistrict: user.selectedDistrict,
        selectedCity: user.selectedCity,
        notificationSettings: user.notificationSettings || {
          pushNotifications: true,
          breakingNews: true,
          localNews: true,
          sportsNews: true,
          entertainmentNews: true
        },
        isVerified: user.isVerified
      },
      isProfileComplete: isProfileComplete
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify OTP. Please try again.'
    });
  }
};

// @desc    Get current user
// @route   GET /api/user/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp');
    
    // Check if profile is complete
    const isProfileComplete = !!(user.gender && user.gender !== '' && user.selectedCategory);
    
    res.json({
      success: true,
      user: {
        id: user.userId || user._id, // Use userId if available, fallback to _id
        userId: user.userId || user._id, // Explicit userId field
        phone: user.phone,
        name: user.name,
        gender: user.gender,
        birthdate: user.birthdate,
        selectedCategory: user.selectedCategory,
        selectedCategories: user.selectedCategories || [],
        selectedDistrict: user.selectedDistrict,
        selectedCity: user.selectedCity,
        notificationSettings: user.notificationSettings || {
          pushNotifications: true,
          breakingNews: true,
          localNews: true,
          sportsNews: true,
          entertainmentNews: true
        },
        isVerified: user.isVerified
      },
      isProfileComplete: isProfileComplete
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, gender, birthdate, selectedCategory, selectedCategories, selectedDistrict, selectedCity, notificationSettings } = req.body;

    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (birthdate !== undefined) {
      user.birthdate = birthdate ? new Date(birthdate) : null;
    }
    if (selectedCategory !== undefined) user.selectedCategory = selectedCategory;
    if (selectedCategories !== undefined) {
      user.selectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];
      // Also update selectedCategory to first one for backward compatibility
      if (selectedCategories.length > 0) {
        user.selectedCategory = selectedCategories[0];
      }
    }
    if (selectedDistrict !== undefined) user.selectedDistrict = selectedDistrict;
    if (selectedCity !== undefined) user.selectedCity = selectedCity;
    if (notificationSettings !== undefined) {
      if (notificationSettings.pushNotifications !== undefined) {
        user.notificationSettings.pushNotifications = notificationSettings.pushNotifications;
      }
      if (notificationSettings.breakingNews !== undefined) {
        user.notificationSettings.breakingNews = notificationSettings.breakingNews;
      }
      if (notificationSettings.localNews !== undefined) {
        user.notificationSettings.localNews = notificationSettings.localNews;
      }
      if (notificationSettings.sportsNews !== undefined) {
        user.notificationSettings.sportsNews = notificationSettings.sportsNews;
      }
      if (notificationSettings.entertainmentNews !== undefined) {
        user.notificationSettings.entertainmentNews = notificationSettings.entertainmentNews;
      }
    }

    await user.save();

    // Check if profile is complete
    const isProfileComplete = !!(user.gender && user.gender !== '' && user.selectedCategory);

    res.json({
      success: true,
      user: {
        id: user.userId || user._id, // Use userId if available, fallback to _id
        userId: user.userId || user._id, // Explicit userId field
        phone: user.phone,
        name: user.name,
        gender: user.gender,
        birthdate: user.birthdate,
        selectedCategory: user.selectedCategory,
        selectedDistrict: user.selectedDistrict,
        selectedCity: user.selectedCity,
        isVerified: user.isVerified
      },
      isProfileComplete: isProfileComplete
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/auth/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete user and related data
    // Note: This will cascade delete bookmarks, comments, ratings, etc. if foreign keys are set up
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


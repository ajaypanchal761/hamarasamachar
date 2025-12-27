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

// @desc Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { phone, purpose = 'registration' } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length !== 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' });
    }

    const otp = generateOTP(6);
    await OTP.deleteMany({ phone: normalizedPhone, isVerified: false });

    const otpRecord = await OTP.createOTP({ otp, phone: normalizedPhone, purpose });

    if (!smsHubIndiaService.isConfigured()) {
      // In development mode, allow OTP without SMS configuration
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          success: true,
          message: 'OTP generated (development mode)',
          otp: otp // Return OTP for development testing
        });
      }
      await OTP.findByIdAndDelete(otpRecord._id);
      return res.status(500).json({ success: false, message: 'SMS service is not configured' });
    }

    let smsSent = false;

    try {
      const smsResult = await smsHubIndiaService.sendOTP(normalizedPhone, otp, 'Hamara Samachar');
      if (smsResult.success) {
        smsSent = true;
        otpRecord.smsSent = true;
        otpRecord.smsMessageId = smsResult.messageId;
        await otpRecord.save();
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'production') {
        await OTP.findByIdAndDelete(otpRecord._id);
        return res.status(500).json({ success: false, message: 'Failed to send OTP' });
      }
    }

    res.json({
      success: true,
      message: smsSent ? 'OTP sent successfully' : 'OTP generated',
      otp: process.env.NODE_ENV === 'development' && !smsSent ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp, purpose = 'verification', fcmToken, deviceId } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

    const otpRecord = await OTP.findValidOTP(normalizedPhone, null, otp, purpose);
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await otpRecord.markAsVerified();

    let user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      user = await User.create({ phone: normalizedPhone, isVerified: true });
    } else {
      user.isVerified = true;
      await user.save();
    }

    // Save FCM token during login if provided (for mobile apps)
    if (fcmToken) {
      try {
        user.fcmTokenMobile = user.fcmTokenMobile || [];
        user.fcmTokenMobile = user.fcmTokenMobile.filter(t => t !== fcmToken);
        user.fcmTokenMobile.push(fcmToken);
        user.fcmTokenMobile = user.fcmTokenMobile.slice(-10); // Keep last 10 tokens
        await user.save();
        console.log('✅ FCM token saved during login for user:', user._id);
      } catch (fcmError) {
        console.error('❌ Error saving FCM token during login:', fcmError);
        // Don't fail login if FCM token save fails
      }
    }

    const token = generateToken(user._id);
    const isProfileComplete = !!(user.gender && user.selectedCategory);

    res.json({
      success: true,
      token,
      user,
      isProfileComplete,
      fcmTokenSaved: !!fcmToken
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Save FCM Token (Web & Mobile)
export const saveFCMToken = async (req, res) => {
  try {
    const { token, platform = 'web', userId, deviceId } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    let targetUserId = req.user?._id || userId;

    // Try to get userId from JWT token if available
    if (!targetUserId && req.headers.authorization) {
      try {
        const decoded = jwt.verify(req.headers.authorization.replace('Bearer ', ''), process.env.JWT_SECRET);
        targetUserId = decoded.id;
      } catch (jwtError) {
        // JWT invalid, continue with guest handling
      }
    }

    if (targetUserId) {
      // User is authenticated - save to their account
      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.fcmTokens = user.fcmTokens || [];
      user.fcmTokenMobile = user.fcmTokenMobile || [];

      user.fcmTokens = user.fcmTokens.filter(t => t !== token);
      user.fcmTokenMobile = user.fcmTokenMobile.filter(t => t !== token);

      platform === 'mobile'
        ? user.fcmTokenMobile.push(token)
        : user.fcmTokens.push(token);

      user.fcmTokens = user.fcmTokens.slice(-10);
      user.fcmTokenMobile = user.fcmTokenMobile.slice(-10);

      await user.save();

      res.json({
        success: true,
        message: 'FCM token saved successfully',
        userType: 'authenticated',
        userId: targetUserId
      });
    } else {
      // Guest user - create or update guest FCM token entry
      const guestDeviceId = deviceId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Find existing guest user or create new one
      let guestUser = await User.findOne({ deviceId: guestDeviceId, isGuest: true });

      if (!guestUser) {
        guestUser = new User({
          deviceId: guestDeviceId,
          isGuest: true,
          status: 'Active',
          name: `Guest User ${guestDeviceId}`,
          // Set default preferences for notifications
          notificationSettings: {
            pushNotifications: true,
            localNews: true
          }
        });
      }

      // Update FCM tokens based on platform
      if (platform === 'mobile') {
        guestUser.fcmTokenMobile = guestUser.fcmTokenMobile || [];
        guestUser.fcmTokenMobile = guestUser.fcmTokenMobile.filter(t => t !== token);
        guestUser.fcmTokenMobile.push(token);
        guestUser.fcmTokenMobile = guestUser.fcmTokenMobile.slice(-10);
      } else {
        guestUser.fcmTokens = guestUser.fcmTokens || [];
        guestUser.fcmTokens = guestUser.fcmTokens.filter(t => t !== token);
        guestUser.fcmTokens.push(token);
        guestUser.fcmTokens = guestUser.fcmTokens.slice(-10);
      }

      await guestUser.save();

      res.json({
        success: true,
        message: 'FCM token saved successfully for guest user',
        userType: 'guest',
        deviceId: guestDeviceId,
        userId: guestUser._id
      });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Save FCM Token (Mobile)
export const saveFCMTokenMobile = async (req, res) => {
  try {
    const { token, userId, deviceId } = req.body;

    if (!token) return res.status(400).json({ success: false, message: 'Token required' });
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required for mobile FCM tokens' });

    let targetUserId = req.user?._id || userId;

    // Try to get userId from JWT token if available (for validation)
    if (!targetUserId && req.headers.authorization) {
      try {
        const decoded = jwt.verify(req.headers.authorization.replace('Bearer ', ''), process.env.JWT_SECRET);
        targetUserId = decoded.id;
      } catch (jwtError) {
        // JWT invalid, continue with userId from body
      }
    }

    // Ensure we have a valid userId
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Valid userId is required' });
    }

    if (targetUserId) {
      // User is authenticated - save to their account
      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.fcmTokens = user.fcmTokens || [];
      user.fcmTokenMobile = user.fcmTokenMobile || [];

      user.fcmTokens = user.fcmTokens.filter(t => t !== token);
      user.fcmTokenMobile = user.fcmTokenMobile.filter(t => t !== token);

      user.fcmTokenMobile.push(token);

      user.fcmTokens = user.fcmTokens.slice(-10);
      user.fcmTokenMobile = user.fcmTokenMobile.slice(-10);

      await user.save();

      res.json({
        success: true,
        message: 'FCM token saved successfully',
        userType: 'authenticated',
        userId: targetUserId
      });
    } else {
      // Guest user - create or update guest FCM token entry
      // We'll use deviceId or generate one to track guest tokens
      const guestDeviceId = deviceId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Find existing guest user or create new one
      let guestUser = await User.findOne({ deviceId: guestDeviceId, isGuest: true });

      if (!guestUser) {
        guestUser = new User({
          deviceId: guestDeviceId,
          isGuest: true,
          status: 'Active',
          fcmTokenMobile: [token],
          name: `Guest User ${guestDeviceId}`,
          // Set default preferences for notifications
          notificationSettings: {
            pushNotifications: true,
            localNews: true
          }
        });
      } else {
        // Update existing guest user's FCM token
        guestUser.fcmTokenMobile = guestUser.fcmTokenMobile || [];
        guestUser.fcmTokenMobile = guestUser.fcmTokenMobile.filter(t => t !== token);
        guestUser.fcmTokenMobile.push(token);
        guestUser.fcmTokenMobile = guestUser.fcmTokenMobile.slice(-10);
      }

      await guestUser.save();

      res.json({
        success: true,
        message: 'FCM token saved successfully for guest user',
        userType: 'guest',
        deviceId: guestDeviceId,
        userId: guestUser._id
      });
    }
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Remove FCM Token
export const removeFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    user.fcmTokens = user.fcmTokens?.filter(t => t !== token) || [];
    user.fcmTokenMobile = user.fcmTokenMobile?.filter(t => t !== token) || [];

    await user.save();

    res.json({ success: true, message: 'FCM token removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        selectedCategories: user.selectedCategories,
        status: user.status,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        notificationSettings: user.notificationSettings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, gender, selectedCategories, notificationSettings } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (selectedCategories !== undefined) user.selectedCategories = selectedCategories;
    if (notificationSettings !== undefined) user.notificationSettings = notificationSettings;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        selectedCategories: user.selectedCategories,
        notificationSettings: user.notificationSettings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc Delete user account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark user as inactive instead of deleting (soft delete)
    user.status = 'Inactive';
    await user.save();

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

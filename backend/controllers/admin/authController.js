import jwt from 'jsonwebtoken';
import Admin from '../../models/Admin.js';
import OTP from '../../models/OTP.js';
import { generateOTP } from '../../utils/otp.js';
import { sendPasswordResetOTP } from '../../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRE || '24h'
  });
};

// @desc    Admin Login (First login creates admin, subsequent logins require matching credentials)
// @route   POST /api/admin/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { usernameOrEmail, password, rememberMe, name } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username/email and password'
      });
    }

    // Check if any admin exists in database
    const adminCount = await Admin.countDocuments();
    const isFirstLogin = adminCount === 0;

    // Determine username and email from usernameOrEmail
    const isEmail = usernameOrEmail.includes('@');
    const email = isEmail ? usernameOrEmail.toLowerCase() : null;
    const username = isEmail ? usernameOrEmail.split('@')[0] : usernameOrEmail;

    if (isFirstLogin) {
      // First login: Create admin account
      // Extract name from email or use provided name
      const adminName = name || (email ? email.split('@')[0] : username) || 'Admin User';

      // Create new admin
      const newAdmin = await Admin.create({
        username: username,
        email: email || `${username}@hamarasamachar.com`,
        password: password,
        name: adminName,
        role: 'super_admin',
        status: 'active'
      });

      // Generate token
      const token = generateToken(newAdmin._id);

      return res.json({
        success: true,
        message: 'Admin account created successfully',
        token,
        admin: {
          id: newAdmin._id,
          username: newAdmin.username,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role,
          phone: newAdmin.phone
        }
      });
    }

    // Admin exists: Only allow login if credentials match the existing admin
    const existingAdmin = await Admin.findOne({});

    if (!existingAdmin) {
      return res.status(500).json({
        success: false,
        message: 'Database error occurred'
      });
    }

    // Check if provided credentials match the existing admin
    const usernameMatch = existingAdmin.username === username || existingAdmin.username === usernameOrEmail;
    const emailMatch = existingAdmin.email === (email || usernameOrEmail.toLowerCase());

    if (!usernameMatch && !emailMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or email. Please check your credentials.'
      });
    }

    // Verify password matches
    if (!password || password.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const isPasswordMatch = await existingAdmin.comparePassword(password.trim());
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Please check your password or use "Forgot Password" to reset it.'
      });
    }

    // Check if admin is active
    if (existingAdmin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Update last login
    existingAdmin.lastLogin = new Date();
    await existingAdmin.save();

    // Generate token
    const token = generateToken(existingAdmin._id);

    res.json({
      success: true,
      token,
      admin: {
        id: existingAdmin._id,
        username: existingAdmin.username,
        email: existingAdmin.email,
        name: existingAdmin.name,
        role: existingAdmin.role,
        phone: existingAdmin.phone
      }
    });
  } catch (error) {
    // Handle duplicate key error (if admin already exists)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Admin account already exists. Please use existing credentials.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        phone: admin.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (name) admin.name = name;
    if (phone) admin.phone = phone;
    if (email && email !== admin.email) {
      // Check if email already exists
      const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      admin.email = email.toLowerCase();
    }

    await admin.save();

    res.json({
      success: true,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        phone: admin.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/admin/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide old and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const admin = await Admin.findById(req.admin._id);

    // Check old password
    const isMatch = await admin.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password - Send OTP to email
// @route   POST /api/admin/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    // For security, don't reveal if email exists or not
    // Always return success message
    if (!admin) {
      // Still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If the email exists, a password reset OTP has been sent'
      });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    // Generate OTP
    const otp = generateOTP(6);

    // Delete any existing password reset OTPs for this email
    await OTP.deleteMany({ 
      email: admin.email.toLowerCase(), 
      purpose: 'password-reset',
      isVerified: false 
    });

    // Create OTP record
    const otpRecord = await OTP.createOTP({
      otp,
      email: admin.email.toLowerCase(),
      purpose: 'password-reset'
    });

    // Send OTP via email
    try {
      await sendPasswordResetOTP(admin.email, otp, admin.name);
      otpRecord.emailSent = true;
      await otpRecord.save();
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Still return success to prevent email enumeration
      return res.json({
        success: true,
        message: 'If the email exists, a password reset OTP has been sent'
      });
    }

    res.json({
      success: true,
      message: 'Password reset OTP has been sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again later.'
    });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/admin/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Find valid OTP
    const otpRecord = await OTP.findValidOTP(null, email.toLowerCase(), otp, 'password-reset');

    if (!otpRecord) {
      // Try to find if OTP exists but is invalid
      const existingOTP = await OTP.findOne({
        email: email.toLowerCase(),
        otp,
        purpose: 'password-reset',
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
        message: 'Invalid or expired OTP'
      });
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      await otpRecord.incrementAttempts();
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Mark OTP as verified
    await otpRecord.markAsVerified();

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred. Please try again later.'
    });
  }
};


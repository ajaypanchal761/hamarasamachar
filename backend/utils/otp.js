import otpGenerator from 'otp-generator';
import dotenv from 'dotenv';

dotenv.config();

// Fixed OTP for testing mode
const TEST_OTP = '110211';

/**
 * Check if TEST OTP mode is enabled
 * @returns {boolean}
 */
export const isTestOTPMode = () => {
  return process.env.TEST_OTP_MODE === 'true' || process.env.TEST_OTP_MODE === '1';
};

/**
 * Generate OTP
 * In TEST_OTP_MODE, always returns fixed OTP "110211"
 * In production mode, generates random OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
export const generateOTP = (length = 6) => {
  // TEST MODE: Return fixed OTP for testing (no SMS will be sent)
  if (isTestOTPMode()) {
    console.log('🧪 TEST OTP MODE: Using fixed OTP (110211) - No SMS will be sent');
    return TEST_OTP;
  }

  // PRODUCTION MODE: Generate random OTP
  return otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export const verifyOTP = (otp, storedOTP) => {
  return otp === storedOTP;
};


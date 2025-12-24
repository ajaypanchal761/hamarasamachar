import otpGenerator from 'otp-generator';

/**
 * Generate OTP
 * Generates a random OTP for SMS authentication
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Generated OTP
 */
export const generateOTP = (length = 6) => {
  return otpGenerator.generate(length, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
};

export const verifyOTP = (otp, storedOTP) => {
  return otp === storedOTP;
};


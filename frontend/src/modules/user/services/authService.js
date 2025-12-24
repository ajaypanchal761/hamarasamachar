// User authentication service for OTP
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

/**
 * Send OTP to phone number
 * @param {string} phone - 10-digit phone number
 * @param {string} purpose - Purpose of OTP (default: 'registration')
 * @returns {Promise<Object>} Response object
 */
export const sendOTP = async (phone, purpose = 'registration') => {
  try {
    // Remove country code and non-digits, keep only 10 digits
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    
    if (normalizedPhone.length !== 10) {
      throw new Error('Please provide a valid 10-digit phone number');
    }

    const response = await fetch(`${API_BASE_URL}/user/auth/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        purpose: purpose
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Send OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP
 * @param {string} phone - 10-digit phone number
 * @param {string} otp - OTP code
 * @param {string} purpose - Purpose of OTP (default: 'registration')
 * @returns {Promise<Object>} Response object with token and user data
 */
export const verifyOTP = async (phone, otp, purpose = 'registration') => {
  try {
    // Remove country code and non-digits, keep only 10 digits
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    
    if (normalizedPhone.length !== 10) {
      throw new Error('Please provide a valid 10-digit phone number');
    }

    if (!otp || otp.length < 4) {
      throw new Error('Please provide a valid OTP');
    }

    const response = await fetch(`${API_BASE_URL}/user/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        otp: otp,
        purpose: purpose
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }

    // Store token and user data in localStorage
    if (data.token) {
      localStorage.setItem('userToken', data.token);
    }
    if (data.user) {
      localStorage.setItem('userData', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Get current user
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/user/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, clear it
      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
      throw new Error(data.message || 'Failed to get user data');
    }

    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, clear it
      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
      throw new Error(data.message || 'Failed to update profile');
    }

    // Update user data in localStorage
    if (data.user) {
      localStorage.setItem('userData', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @returns {Promise<Object>} Response object
 */
export const deleteAccount = async () => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/auth/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // If token is invalid, clear it
      if (response.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
      throw new Error(data.message || 'Failed to delete account');
    }

    // Clear all user data on successful deletion
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('userCategories');
    localStorage.removeItem('userCity');

    return data;
  } catch (error) {
    console.error('Delete account error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
};


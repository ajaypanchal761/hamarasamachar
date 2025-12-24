const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

/**
 * Create payment order
 * @param {String} planId - Plan ID (monthly/yearly)
 * @param {String} planType - Plan type (monthly/yearly)
 * @param {Number} price - Price in rupees
 * @returns {Promise<Object>} Order details with Razorpay order ID
 */
export const createPaymentOrder = async (planId, planType, price) => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ planId, planType, price })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment order');
    }

    return data;
  } catch (error) {
    console.error('Create payment order error:', error);
    throw error;
  }
};

/**
 * Verify payment and activate subscription
 * @param {String} orderId - Razorpay order ID
 * @param {String} paymentId - Razorpay payment ID
 * @param {String} signature - Razorpay signature
 * @param {String} planId - Plan ID
 * @param {String} planType - Plan type
 * @param {Number} price - Price paid
 * @returns {Promise<Object>} Subscription details
 */
export const verifyPayment = async (orderId, paymentId, signature, planId, planType, price) => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderId, paymentId, signature, planId, planType, price })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verify payment error:', error);
    throw error;
  }
};

/**
 * Get user subscription status
 * @returns {Promise<Object>} Subscription status
 */
export const getSubscriptionStatus = async () => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      return {
        success: true,
        data: {
          isActive: false,
          subscription: null
        }
      };
    }

    const response = await fetch(`${API_BASE_URL}/user/payment/subscription-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get subscription status');
    }

    return data;
  } catch (error) {
    console.error('Get subscription status error:', error);
    // Return inactive status on error
    return {
      success: true,
      data: {
        isActive: false,
        subscription: null
      }
    };
  }
};

/**
 * Get payment history
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Payment history
 */
export const getPaymentHistory = async (options = {}) => {
  try {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      throw new Error('User not authenticated');
    }

    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({ page, limit });

    const response = await fetch(`${API_BASE_URL}/user/payment/history?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get payment history');
    }

    return data;
  } catch (error) {
    console.error('Get payment history error:', error);
    throw error;
  }
};


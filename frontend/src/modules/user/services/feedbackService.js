// Feedback service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Submit feedback
 * @param {string} type - Feedback type ('app' or 'news')
 * @param {string} text - Feedback text
 * @returns {Promise<Object>} Response object
 */
export const submitFeedback = async (type, text) => {
  try {
    const token = localStorage.getItem('userToken');

    // Map frontend type to backend type
    const backendType = type === 'app' ? 'App Feedback' : 'News Feedback';

    const response = await fetch(`${API_BASE_URL}/user/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        type: backendType,
        text: text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit feedback');
    }

    return data;
  } catch (error) {
    console.error('Submit feedback error:', error);
    throw error;
  }
};

/**
 * Get user's feedbacks (if API exists)
 * @returns {Promise<Array>} Array of feedbacks
 */
export const getMyFeedbacks = async () => {
  try {
    const token = localStorage.getItem('userToken');

    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/user/feedback/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get feedbacks');
    }

    return data.data || [];
  } catch (error) {
    console.error('Get feedbacks error:', error);
    return [];
  }
};










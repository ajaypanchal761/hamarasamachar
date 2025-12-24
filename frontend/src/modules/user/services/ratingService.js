// Rating service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

/**
 * Submit app rating
 * @param {number} rating - Rating (1-5)
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} Response object
 */
export const submitRating = async (rating, comment = '') => {
  try {
    const token = localStorage.getItem('userToken');

    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/user/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        rating: rating,
        comment: comment
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit rating');
    }

    return data;
  } catch (error) {
    console.error('Submit rating error:', error);
    throw error;
  }
};

/**
 * Get user's rating
 * @returns {Promise<Object|null>} Rating object or null
 */
export const getMyRating = async () => {
  try {
    const token = localStorage.getItem('userToken');

    if (!token) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/user/ratings/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(data.message || 'Failed to get rating');
    }

    return data.data || null;
  } catch (error) {
    console.error('Get rating error:', error);
    return null;
  }
};










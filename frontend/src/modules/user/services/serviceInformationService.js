// Service Information service for users
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

/**
 * Get user's service information
 * @returns {Promise<Array>} Array of service information
 */
export const getMyServiceInformation = async () => {
  try {
    const token = localStorage.getItem('userToken');

    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/user/service-information`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get service information');
    }

    return data.data || [];
  } catch (error) {
    console.error('Get service information error:', error);
    return [];
  }
};

/**
 * Delete user's service information (mark as read/deleted)
 * @param {string} id - Service information ID
 * @returns {Promise<Object>} Response object
 */
export const deleteServiceInformation = async (id) => {
  try {
    const token = localStorage.getItem('userToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/user/service-information/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete service information');
    }

    return data;
  } catch (error) {
    console.error('Delete service information error:', error);
    throw error;
  }
};

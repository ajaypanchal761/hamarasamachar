// Category service for user panel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

/**
 * Get all active categories
 * @returns {Promise<Array>} Array of category objects
 */
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch categories');
    }

    return data.data || [];
  } catch (error) {
    console.error('Get all categories error:', error);
    throw error;
  }
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object>} Category object
 */
export const getCategoryBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/categories/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch category');
    }

    return data.data;
  } catch (error) {
    console.error('Get category by slug error:', error);
    throw error;
  }
};

export const categoryService = {
  getAllCategories,
  getCategoryBySlug
};


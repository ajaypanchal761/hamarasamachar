// Banner management service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

// Helper function to transform backend banner to frontend format
const transformBanner = (backendBanner) => {
  return {
    id: backendBanner._id,
    _id: backendBanner._id,
    title: backendBanner.title || '',
    imageUrl: backendBanner.imageUrl || '',
    videoUrl: backendBanner.videoUrl || '',
    link: backendBanner.link || '',
    position: backendBanner.position || 'news_feed',
    category: backendBanner.category || '',
    order: backendBanner.order || 0,
    status: backendBanner.status || 'active',
    target: backendBanner.target || '_self',
    clicks: backendBanner.clicks || 0,
    views: backendBanner.views || 0,
    createdAt: backendBanner.createdAt,
    updatedAt: backendBanner.updatedAt
  };
};

export const bannerService = {
  // Get all banners
  getAll: async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/banners`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch banners');
      }
      
      const data = await response.json();
      return data.data.map(transformBanner);
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  // Get banner by ID
  getById: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch banner');
      }
      
      const data = await response.json();
      return transformBanner(data.data);
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  },

  // Create new banner
  create: async (formData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/banners`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create banner');
      }
      
      const data = await response.json();
      return transformBanner(data.data);
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  // Update banner
  update: async (id, formData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update banner');
      }
      
      const data = await response.json();
      return transformBanner(data.data);
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  // Delete banner
  delete: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete banner');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  // Get banners by position and optionally by category
  getByPosition: async (position, category = null) => {
    try {
      const token = getAuthToken();
      let url = `${API_BASE_URL}/admin/banners/position/${position}`;
      if (category) {
        url += `?category=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch banners by position');
      }
      
      const data = await response.json();
      return data.data.map(transformBanner);
    } catch (error) {
      console.error('Error fetching banners by position:', error);
      throw error;
    }
  }
};

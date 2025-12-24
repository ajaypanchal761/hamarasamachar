const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

// Helper function to transform backend category to frontend format
const transformCategory = (backendCategory) => {
  return {
    id: backendCategory._id,
    _id: backendCategory._id,
    name: backendCategory.name || '',
    description: backendCategory.description || '',
    icon: backendCategory.icon || '',
    color: backendCategory.color || '#E21E26',
    order: backendCategory.order || 0,
    status: backendCategory.status || 'active',
    newsCount: backendCategory.newsCount || 0,
    slug: backendCategory.slug || '',
    createdAt: backendCategory.createdAt,
    updatedAt: backendCategory.updatedAt
  };
};

export const categoryService = {
  // Get all categories
  getAll: async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch categories');
      }

      const data = await response.json();
      return (data.data || []).map(transformCategory).sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getById: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch category');
      }

      const data = await response.json();
      return transformCategory(data.data);
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Create new category
  create: async (categoryData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create category');
      }

      const data = await response.json();
      return transformCategory(data.data);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  update: async (id, categoryData) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update category');
      }

      const data = await response.json();
      return transformCategory(data.data);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  delete: async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete category');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  // Reorder categories
  reorder: async (categoryIds) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/categories/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryIds })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder categories');
      }

      const data = await response.json();
      return (data.data || []).map(transformCategory);
    } catch (error) {
      console.error('Error reordering categories:', error);
      throw error;
    }
  }
};

export default categoryService;

// Dashboard service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

export const dashboardService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};



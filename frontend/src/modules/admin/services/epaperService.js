const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

export const epaperService = {
    getAllEpapers: async (filters = {}) => {
        try {
            const token = getAuthToken();
            const params = new URLSearchParams();
            
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.page) params.append('page', filters.page);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await fetch(`${API_BASE_URL}/admin/epaper?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch e-papers');
            }

            return data;
        } catch (error) {
            console.error('Get all epapers error:', error);
            throw error;
        }
    },

    uploadEpaper: async (uploadData) => {
        try {
            const token = getAuthToken();
            
            // Create FormData
            const formData = new FormData();
            formData.append('date', uploadData.date);
            formData.append('file', uploadData.file); // PDF file
            
            // Add cover image if provided
            if (uploadData.coverImage) {
                formData.append('coverImage', uploadData.coverImage);
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/epaper`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type header - browser will set it with boundary for FormData
                },
                body: formData
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload e-paper');
            }

            return data;
        } catch (error) {
            console.error('Upload epaper error:', error);
            throw error;
        }
    },

    deleteEpaper: async (id) => {
        try {
            const token = getAuthToken();
            
            const response = await fetch(`${API_BASE_URL}/admin/epaper/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete e-paper');
            }

            return data;
        } catch (error) {
            console.error('Delete epaper error:', error);
            throw error;
        }
    }
};


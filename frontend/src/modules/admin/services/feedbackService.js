import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const feedbackService = {
    getAllFeedbacks: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filters.type && filters.type !== '') {
                params.append('type', filters.type);
            }
            if (filters.status && filters.status !== '') {
                params.append('status', filters.status);
            }
            if (filters.search) {
                params.append('search', filters.search);
            }
            if (filters.startDate) {
                params.append('startDate', filters.startDate);
            }
            if (filters.endDate) {
                params.append('endDate', filters.endDate);
            }
            params.append('page', '1');
            params.append('limit', '1000'); // Get all feedbacks

            const response = await fetch(`${API_BASE_URL}/admin/feedback?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch feedbacks');
            }

            // Transform backend data to frontend format
            const transformedFeedbacks = data.data.map(feedback => ({
                id: feedback._id || feedback.id,
                type: feedback.type,
                text: feedback.text,
                user: feedback.user ? {
                    id: feedback.user.userId || feedback.user._id || feedback.user.id,
                    userId: feedback.user.userId || feedback.user._id || feedback.user.id,
                    name: feedback.user.name || 'Anonymous',
                    contact: feedback.user.phone || 'N/A'
                } : null,
                date: feedback.createdAt,
                status: feedback.status || 'New'
            }));

            return {
                data: transformedFeedbacks,
                total: data.total || transformedFeedbacks.length
            };
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            throw error;
        }
    },

    getFeedbackById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch feedback');
            }

            const feedback = data.data;
            return {
                id: feedback._id || feedback.id,
                type: feedback.type,
                text: feedback.text,
                user: feedback.user ? {
                    id: feedback.user.userId || feedback.user._id || feedback.user.id,
                    userId: feedback.user.userId || feedback.user._id || feedback.user.id,
                    name: feedback.user.name || 'Anonymous',
                    contact: feedback.user.phone || 'N/A'
                } : null,
                date: feedback.createdAt,
                status: feedback.status || 'New'
            };
        } catch (error) {
            console.error('Error fetching feedback:', error);
            throw error;
        }
    },

    updateStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update feedback status');
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating feedback status:', error);
            throw error;
        }
    },

    deleteFeedback: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/feedback/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete feedback');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    },

    getUnreadCount: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/feedback/unread-count`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch unread count');
            }

            return data.count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }
};

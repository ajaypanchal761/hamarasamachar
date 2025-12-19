import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const ratingService = {
    getAllRatings: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
            if (filters.rating && filters.rating !== '') {
                params.append('rating', filters.rating);
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
            if (filters.sortBy) {
                params.append('sortBy', filters.sortBy === 'date' ? 'date' : 'rating');
            }
            params.append('page', '1');
            params.append('limit', '1000'); // Get all ratings

            const response = await fetch(`${API_BASE_URL}/admin/ratings?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch ratings');
            }

            // Transform backend data to frontend format
            const transformedRatings = data.data.map(rating => ({
                id: rating._id || rating.id,
                rating: rating.rating,
                comment: rating.comment || '',
                user: rating.user ? {
                    id: rating.user.userId || rating.user._id || rating.user.id,
                    userId: rating.user.userId || rating.user._id || rating.user.id,
                    phone: rating.user.phone || 'N/A',
                    name: rating.user.name || 'Anonymous'
                } : null,
                date: rating.createdAt,
                reply: rating.reply || ''
            }));

            return {
                data: transformedRatings,
                total: data.total || transformedRatings.length
            };
        } catch (error) {
            console.error('Error fetching ratings:', error);
            throw error;
        }
    },

    getRatingStats: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/ratings/stats`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch rating stats');
            }

            const statsData = data.data || {};
            
            // Transform recent ratings
            const recentRatings = (statsData.recent || []).map(rating => ({
                id: rating._id || rating.id,
                rating: rating.rating,
                comment: rating.comment || '',
                user: rating.user ? {
                    id: rating.user.userId || rating.user._id || rating.user.id,
                    userId: rating.user.userId || rating.user._id || rating.user.id,
                    phone: rating.user.phone || 'N/A',
                    name: rating.user.name || 'Anonymous'
                } : null,
                date: rating.createdAt,
                reply: rating.reply || ''
            }));

            return {
                average: statsData.average || 0,
                total: statsData.total || 0,
                recent: recentRatings
            };
        } catch (error) {
            console.error('Error fetching rating stats:', error);
            throw error;
        }
    },

    addReply: async (id, replyText) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/ratings/${id}/reply`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ replyText })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to add reply');
            }

            return { success: true };
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    },

    deleteRating: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/ratings/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete rating');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw error;
        }
    }
};

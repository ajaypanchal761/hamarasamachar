import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const userService = {
    getAllUsers: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            
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
            params.append('limit', '1000'); // Get all users

            const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch users');
            }

            // Transform backend data to frontend format
            const transformedUsers = data.data.map(user => ({
                id: user.userId || user._id || user.id, // Use userId if available
                userId: user.userId || user._id || user.id, // Explicit userId field
                phone: user.phone,
                gender: user.gender || '',
                birthdate: user.birthdate || user.createdAt,
                status: user.status || 'Active',
                registrationDate: user.createdAt,
                selectedCategory: user.selectedCategory || '',
                name: user.name || '',
                stats: user.stats || { bookmarks: 0, views: 0, comments: 0 }
            }));

            return {
                data: transformedUsers,
                total: data.total || transformedUsers.length
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    getUserById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user');
            }

            const user = data.data;
            return {
                id: user.userId || user._id || user.id, // Use userId if available
                userId: user.userId || user._id || user.id, // Explicit userId field
                phone: user.phone,
                gender: user.gender || '',
                birthdate: user.birthdate || user.createdAt,
                status: user.status || 'Active',
                registrationDate: user.createdAt,
                selectedCategory: user.selectedCategory || '',
                name: user.name || '',
                stats: user.stats || { bookmarks: 0, views: 0, comments: 0 }
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    updateUser: async (id, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update user');
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    updateUserStatus: async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update user status');
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete user');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    bulkUpdateStatus: async (ids, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/bulk-status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ids, status })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update users status');
            }

            return { success: true };
        } catch (error) {
            console.error('Error bulk updating users status:', error);
            throw error;
        }
    },

    bulkDelete: async (ids) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/bulk-delete`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ids })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete users');
            }

            return { success: true };
        } catch (error) {
            console.error('Error bulk deleting users:', error);
            throw error;
        }
    },

    getUserStats: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/stats`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch user stats');
            }

            return data.data || { total: 0, active: 0, newUsers: 0 };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    }
};

import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

const getAuthHeaders = () => {
    const token = authService.getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

export const serviceInformationService = {
    // Get all service information entries
    getAllServiceInformation: async (filters = {}) => {
        try {
            const params = new URLSearchParams();

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
            params.append('limit', '1000'); // Get all service information

            const response = await fetch(`${API_BASE_URL}/admin/service-information?${params.toString()}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch service information');
            }

            // Transform backend data to frontend format
            const transformedServiceInfo = data.data.map(info => ({
                id: info._id || info.id,
                title: info.title,
                message: info.message,
                createdBy: info.createdBy,
                createdAt: info.createdAt,
                sentToAll: info.sentToAll || true
            }));

            return {
                data: transformedServiceInfo,
                total: data.total || transformedServiceInfo.length
            };
        } catch (error) {
            console.error('Error fetching service information:', error);
            throw error;
        }
    },

    // Get service information by ID
    getServiceInformationById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/service-information/${id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch service information');
            }

            const info = data.data;
            return {
                id: info._id || info.id,
                title: info.title,
                message: info.message,
                createdBy: info.createdBy,
                createdAt: info.createdAt,
                sentToAll: info.sentToAll || true
            };
        } catch (error) {
            console.error('Error fetching service information:', error);
            throw error;
        }
    },

    // Create new service information and send to all users
    createServiceInformation: async (serviceInfoData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/service-information`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: serviceInfoData.title,
                    message: serviceInfoData.message,
                    sentToAll: true
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create service information');
            }

            return {
                id: result.data._id || result.data.id,
                title: result.data.title,
                message: result.data.message,
                createdBy: result.data.createdBy,
                createdAt: result.data.createdAt,
                sentToAll: result.data.sentToAll
            };
        } catch (error) {
            console.error('Error creating service information:', error);
            throw error;
        }
    },

    // Update service information
    updateServiceInformation: async (id, serviceInfoData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/service-information/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: serviceInfoData.title,
                    message: serviceInfoData.message
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update service information');
            }

            return { success: true };
        } catch (error) {
            console.error('Error updating service information:', error);
            throw error;
        }
    },

    // Delete service information
    deleteServiceInformation: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/service-information/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete service information');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting service information:', error);
            throw error;
        }
    }
};

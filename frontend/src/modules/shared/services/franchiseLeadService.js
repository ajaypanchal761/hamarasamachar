const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all franchise leads (Admin only) - Using API
 * @param {Object} filters - Filter options (status, search, page, limit, source)
 * @returns {Promise<Array>} Array of leads
 */
export const getLeads = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.status) queryParams.append('status', filters.status);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.source) queryParams.append('source', filters.source);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const response = await fetch(`${API_BASE_URL}/admin/franchise-leads?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch leads');
    }

    return result.data || [];
  } catch (error) {
    console.error('Get leads error:', error);
    return [];
  }
};

/**
 * Get lead statistics (Admin only) - Using API
 * @param {Object} filters - Filter options (source)
 * @returns {Promise<Object>} Statistics object
 */
export const getLeadStats = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (filters.source) queryParams.append('source', filters.source);

    const response = await fetch(`${API_BASE_URL}/admin/franchise-leads/stats?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch lead stats');
    }

    return result.data || { total: 0, new: 0, contacted: 0, closed: 0 };
  } catch (error) {
    console.error('Get lead stats error:', error);
    return { total: 0, new: 0, contacted: 0, closed: 0 };
  }
};

/**
 * Add a new franchise lead (Public) - Using API
 * @param {Object} leadInput - Lead data (name, phone, address, source, qualification, age, additionalInfo)
 * @returns {Promise<Object>} Created lead object
 */
export const addLead = async (leadInput) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/franchise-leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: leadInput.name,
        phone: leadInput.phone,
        address: leadInput.address,
        source: leadInput.source || 'website',
        qualification: leadInput.qualification || '',
        age: leadInput.age || '',
        additionalInfo: leadInput.additionalInfo || ''
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create lead');
    }

    return result.data;
  } catch (error) {
    console.error('Add lead error:', error);
    throw error;
  }
};

/**
 * Update franchise lead status (Admin only) - Using API
 * @param {string} leadId - Lead ID
 * @param {string} status - New status (new, contacted, closed)
 * @returns {Promise<Object>} Updated lead object
 */
export const updateLeadStatus = async (leadId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/franchise-leads/${leadId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ status })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update lead status');
    }

    return result.data;
  } catch (error) {
    console.error('Update lead status error:', error);
    throw error;
  }
};





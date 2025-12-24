const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
};

/**
 * Get all plans from backend
 * @returns {Promise<Array>} Array of plans
 */
export const getPlans = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch plans');
    }

    // Transform API response to match frontend format
    return (data.data || []).map(plan => ({
      id: plan._id || plan.id,
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      status: plan.status || 'active',
      order: plan.order || 0
    }));
  } catch (error) {
    console.error('Get plans error:', error);
    throw error;
  }
};

/**
 * Create a new plan
 * @param {Object} planInput - Plan data
 * @returns {Promise<Object>} Created plan
 */
export const createPlan = async (planInput) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planInput)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create plan');
    }

    // Transform API response
    const plan = data.data;
    return {
      id: plan._id || plan.id,
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      status: plan.status || 'active',
      order: plan.order || 0
    };
  } catch (error) {
    console.error('Create plan error:', error);
    throw error;
  }
};

/**
 * Update a plan
 * @param {String} planId - Plan ID
 * @param {Object} planInput - Updated plan data
 * @returns {Promise<Object>} Updated plan
 */
export const updatePlan = async (planId, planInput) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans/${planId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(planInput)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update plan');
    }

    const plan = data.data;
    return {
      id: plan._id || plan.id,
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      status: plan.status || 'active',
      order: plan.order || 0
    };
  } catch (error) {
    console.error('Update plan error:', error);
    throw error;
  }
};

/**
 * Delete a plan
 * @param {String} planId - Plan ID
 * @returns {Promise<Array>} Updated plans array
 */
export const deletePlan = async (planId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans/${planId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete plan');
    }

    // Return updated plans list
    return await getPlans();
  } catch (error) {
    console.error('Delete plan error:', error);
    throw error;
  }
};

/**
 * Get all subscribers from backend
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of subscribers
 */
export const getSubscribers = async (filters = {}) => {
  try {
    const token = getAuthToken();
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.planId) params.append('planId', filters.planId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await fetch(`${API_BASE_URL}/admin/plans/subscribers?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch subscribers');
    }

    // Transform API response to match frontend format
    return (data.data || []).map(sub => ({
      id: sub.id,
      name: sub.name,
      email: sub.email,
      phone: sub.phone,
      planId: sub.planId,
      planName: sub.planName,
      billingCycle: sub.billingCycle,
      amount: sub.amount,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status
    }));
  } catch (error) {
    console.error('Get subscribers error:', error);
    throw error;
  }
};

/**
 * Get plan statistics
 * @returns {Promise<Object>} Plan statistics
 */
export const getPlanStats = async () => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch plan statistics');
    }

    return data.data;
  } catch (error) {
    console.error('Get plan stats error:', error);
    throw error;
  }
};

/**
 * Update a subscription
 * @param {String} subscriptionId - Subscription ID
 * @param {Object} subscriptionInput - Updated subscription data
 * @returns {Promise<Object>} Updated subscription
 */
export const updateSubscription = async (subscriptionId, subscriptionInput) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans/subscribers/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(subscriptionInput)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update subscription');
    }

    return data.data;
  } catch (error) {
    console.error('Update subscription error:', error);
    throw error;
  }
};

/**
 * Delete a subscription
 * @param {String} subscriptionId - Subscription ID
 * @returns {Promise<void>}
 */
export const deleteSubscription = async (subscriptionId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/plans/subscribers/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete subscription');
    }

    return data;
  } catch (error) {
    console.error('Delete subscription error:', error);
    throw error;
  }
};









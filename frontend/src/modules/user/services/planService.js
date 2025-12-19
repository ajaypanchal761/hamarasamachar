const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get all active plans for users
 * @returns {Promise<Array>} Array of active plans
 */
export const getActivePlans = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch plans');
    }

    // Transform API response to match frontend format
    return (data.data || []).map(plan => ({
      id: plan.id || plan.planId,
      planId: plan.planId || plan.id,
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      period: plan.period || (plan.billingCycle === 'monthly' ? 'प्रति माह' : 'प्रति वर्ष')
    }));
  } catch (error) {
    console.error('Get active plans error:', error);
    throw error;
  }
};

/**
 * Get plan by ID
 * @param {String} planId - Plan ID
 * @returns {Promise<Object>} Plan data
 */
export const getPlanById = async (planId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/plans/${planId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch plan');
    }

    const plan = data.data;
    return {
      id: plan.id || plan.planId,
      planId: plan.planId || plan.id,
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      period: plan.period || (plan.billingCycle === 'monthly' ? 'प्रति माह' : 'प्रति वर्ष')
    };
  } catch (error) {
    console.error('Get plan by ID error:', error);
    throw error;
  }
};


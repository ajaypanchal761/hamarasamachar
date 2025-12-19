import Plan from '../../models/Plan.js';

// @desc    Get all active plans for users
// @route   GET /api/user/plans
// @access  Public
export const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: 'active' })
      .sort({ order: 1, createdAt: -1 })
      .select('name billingCycle price description features');

    // Transform plans to match frontend format
    const transformedPlans = plans.map(plan => ({
      id: plan._id.toString(),
      planId: plan._id.toString(),
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      period: plan.billingCycle === 'monthly' ? 'प्रति माह' : 'प्रति वर्ष'
    }));

    res.json({
      success: true,
      data: transformedPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch plans'
    });
  }
};

// @desc    Get plan by ID
// @route   GET /api/user/plans/:id
// @access  Public
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      _id: req.params.id,
      status: 'active'
    }).select('name billingCycle price description features');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const transformedPlan = {
      id: plan._id.toString(),
      planId: plan._id.toString(),
      name: plan.name,
      billingCycle: plan.billingCycle,
      price: plan.price,
      description: plan.description || '',
      features: plan.features || [],
      period: plan.billingCycle === 'monthly' ? 'प्रति माह' : 'प्रति वर्ष'
    };

    res.json({
      success: true,
      data: transformedPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch plan'
    });
  }
};


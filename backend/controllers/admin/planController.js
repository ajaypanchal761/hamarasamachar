import Plan from '../../models/Plan.js';
import Subscription from '../../models/Subscription.js';
import Payment from '../../models/Payment.js';
import User from '../../models/User.js';

// @desc    Get all plans
// @route   GET /api/admin/plans
// @access  Private (Admin)
export const getAllPlans = async (req, res) => {
  try {
    const { status, billingCycle, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (billingCycle && billingCycle !== 'All') {
      query.billingCycle = billingCycle;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const plans = await Plan.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Plan.countDocuments(query);

    res.json({
      success: true,
      data: plans,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get plan by ID
// @route   GET /api/admin/plans/:id
// @access  Private (Admin)
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create plan
// @route   POST /api/admin/plans
// @access  Private (Admin)
export const createPlan = async (req, res) => {
  try {
    const { name, billingCycle, price, description, features, status, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Plan name is required'
      });
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Valid billing cycle is required (monthly/yearly)'
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid price is required'
      });
    }

    const plan = await Plan.create({
      name: name.trim(),
      billingCycle,
      price: parseFloat(price),
      description: description || '',
      features: features || [],
      status: status || 'active',
      order: order || 0
    });

    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create plan'
    });
  }
};

// @desc    Update plan
// @route   PUT /api/admin/plans/:id
// @access  Private (Admin)
export const updatePlan = async (req, res) => {
  try {
    const { name, billingCycle, price, description, features, status, order } = req.body;

    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    if (name) plan.name = name.trim();
    if (billingCycle && ['monthly', 'yearly'].includes(billingCycle)) plan.billingCycle = billingCycle;
    if (price !== undefined) plan.price = parseFloat(price);
    if (description !== undefined) plan.description = description;
    if (features !== undefined) plan.features = features;
    if (status) plan.status = status;
    if (order !== undefined) plan.order = order;

    await plan.save();

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update plan'
    });
  }
};

// @desc    Delete plan
// @route   DELETE /api/admin/plans/:id
// @access  Private (Admin)
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Check if plan has active subscriptions
    const activeSubscriptions = await Subscription.countDocuments({
      planId: plan._id.toString(),
      status: 'active'
    });

    if (activeSubscriptions > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete plan. ${activeSubscriptions} active subscription(s) exist.`
      });
    }

    await plan.deleteOne();

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete plan'
    });
  }
};

// @desc    Get all subscribers (with subscription and payment details)
// @route   GET /api/admin/plans/subscribers
// @access  Private (Admin)
export const getAllSubscribers = async (req, res) => {
  try {
    const { status, planId, startDate, endDate, search, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'All') {
      if (status === 'Active') {
        query.status = 'active';
        query.endDate = { $gt: new Date() };
      } else if (status === 'Expired') {
        query.$or = [
          { status: 'expired' },
          { status: 'active', endDate: { $lte: new Date() } }
        ];
      }
    }

    if (planId) {
      query.planId = planId;
    }

    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get subscriptions with user details
    let subscriptions = await Subscription.find(query)
      .populate('user', 'name phone userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get all payment IDs for these subscriptions in one query
    const subscriptionIds = subscriptions.map(sub => sub._id);
    const payments = await Payment.find({
      subscription: { $in: subscriptionIds },
      status: 'success'
    }).sort({ createdAt: -1 });

    // Create a map of subscription ID to payment
    const paymentMap = new Map();
    payments.forEach(payment => {
      const subId = payment.subscription.toString();
      if (!paymentMap.has(subId)) {
        paymentMap.set(subId, payment);
      }
    });

    // Get payment details for each subscription
    const subscriptionsWithPayments = subscriptions.map((sub) => {
      const payment = paymentMap.get(sub._id.toString());

      // Determine status based on endDate
      let displayStatus = sub.status;
      if (sub.status === 'active' && new Date() > sub.endDate) {
        displayStatus = 'Expired';
      } else if (sub.status === 'active') {
        displayStatus = 'Active';
      } else if (sub.status === 'expired') {
        displayStatus = 'Expired';
      }

      return {
        id: sub._id.toString(),
        name: sub.user?.name || sub.user?.userId || 'Unknown',
        userId: sub.user?.userId || '',
        email: '', // User model doesn't have email field
        phone: sub.user?.phone || '',
        planId: sub.planId,
        planName: sub.plan === 'monthly' ? 'मासिक प्लान' : 'वार्षिक प्लान',
        billingCycle: sub.plan,
        amount: sub.price,
        startDate: sub.startDate.toISOString().split('T')[0],
        endDate: sub.endDate.toISOString().split('T')[0],
        status: displayStatus,
        paymentId: payment?._id?.toString() || '',
        createdAt: sub.createdAt
      };
    });

    // Apply search filter if provided
    let filteredSubscribers = subscriptionsWithPayments;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSubscribers = subscriptionsWithPayments.filter(sub => 
        sub.name.toLowerCase().includes(searchLower) ||
        sub.email.toLowerCase().includes(searchLower) ||
        sub.phone.includes(search)
      );
    }

    const total = await Subscription.countDocuments(query);

    res.json({
      success: true,
      data: filteredSubscribers,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscribers'
    });
  }
};

// @desc    Get plan statistics
// @route   GET /api/admin/plans/stats
// @access  Private (Admin)
export const getPlanStats = async (req, res) => {
  try {
    const totalPlans = await Plan.countDocuments();
    const monthlyPlans = await Plan.countDocuments({ billingCycle: 'monthly', status: 'active' });
    const yearlyPlans = await Plan.countDocuments({ billingCycle: 'yearly', status: 'active' });
    
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({
      status: 'active',
      endDate: { $gt: new Date() }
    });
    const expiredSubscriptions = await Subscription.countDocuments({
      $or: [
        { status: 'expired' },
        { status: 'active', endDate: { $lte: new Date() } }
      ]
    });

    // Calculate total revenue
    const payments = await Payment.find({ status: 'success' });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.json({
      success: true,
      data: {
        plans: {
          total: totalPlans,
          monthly: monthlyPlans,
          yearly: yearlyPlans
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          expired: expiredSubscriptions
        },
        revenue: {
          total: totalRevenue
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get plan statistics'
    });
  }
};

// @desc    Update subscription
// @route   PUT /api/admin/plans/subscribers/:id
// @access  Private (Admin)
export const updateSubscription = async (req, res) => {
  try {
    const { planId, plan, price, startDate, endDate, status } = req.body;
    const subscriptionId = req.params.id;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update fields if provided
    if (planId) subscription.planId = planId;
    if (plan && ['monthly', 'yearly'].includes(plan)) subscription.plan = plan;
    if (price !== undefined && price > 0) subscription.price = parseFloat(price);
    if (startDate) subscription.startDate = new Date(startDate);
    if (endDate) subscription.endDate = new Date(endDate);
    if (status && ['active', 'expired', 'cancelled'].includes(status)) {
      subscription.status = status;
    }

    await subscription.save();

    // Populate user for response
    await subscription.populate('user', 'name phone userId');

    res.json({
      success: true,
      data: {
        id: subscription._id.toString(),
        name: subscription.user?.name || subscription.user?.userId || 'Unknown',
        userId: subscription.user?.userId || '',
        phone: subscription.user?.phone || '',
        planId: subscription.planId,
        planName: subscription.plan === 'monthly' ? 'मासिक प्लान' : 'वार्षिक प्लान',
        billingCycle: subscription.plan,
        amount: subscription.price,
        startDate: subscription.startDate.toISOString().split('T')[0],
        endDate: subscription.endDate.toISOString().split('T')[0],
        status: subscription.status === 'active' && new Date() <= subscription.endDate ? 'Active' : 
                subscription.status === 'expired' || (subscription.status === 'active' && new Date() > subscription.endDate) ? 'Expired' : 
                subscription.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update subscription'
    });
  }
};

// @desc    Delete subscription
// @route   DELETE /api/admin/plans/subscribers/:id
// @access  Private (Admin)
export const deleteSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Delete associated payment records
    await Payment.deleteMany({ subscription: subscriptionId });

    // Delete subscription
    await subscription.deleteOne();

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete subscription'
    });
  }
};


import { createOrder, verifyPayment, getRazorpayKeyId } from '../../services/paymentService.js';
import Subscription from '../../models/Subscription.js';
import Payment from '../../models/Payment.js';
import User from '../../models/User.js';

// @desc    Create payment order
// @route   POST /api/user/payment/create-order
// @access  Private
export const createPaymentOrder = async (req, res) => {
  try {
    const { planId, planType, price } = req.body;
    const userId = req.user._id;

    if (!planId || !planType || !price) {
      return res.status(400).json({
        success: false,
        message: 'Plan details are required'
      });
    }

    if (!['monthly', 'yearly'].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price'
      });
    }

    // Generate receipt ID (max 40 characters for Razorpay)
    // Format: sub_<userId_last12chars>_<timestamp_last8digits>
    const userIdStr = userId.toString();
    const userIdShort = userIdStr.slice(-12); // Last 12 characters of ObjectId
    const timestampShort = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const receipt = `sub_${userIdShort}_${timestampShort}`; // Max 4 + 12 + 1 + 8 = 25 characters
    
    const order = await createOrder(price, 'INR', receipt);

    if (!order.success) {
      // Return detailed error message from Razorpay
      const errorMessage = order.error || 'Failed to create payment order';
      console.error('Payment order creation failed:', errorMessage);
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: order.error
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        amount: order.amount,
        keyId: getRazorpayKeyId()
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order'
    });
  }
};

// @desc    Verify payment and create subscription
// @route   POST /api/user/payment/verify
// @access  Private
export const verifyPaymentAndSubscribe = async (req, res) => {
  try {
    const { orderId, paymentId, signature, planId, planType, price } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!orderId || !paymentId || !signature || !planId || !planType || !price) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      });
    }

    // Verify payment signature
    const isValid = verifyPayment(orderId, paymentId, signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Calculate end date based on plan type
    const startDate = new Date();
    const endDate = new Date();
    
    if (planType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    });

    // Create subscription
    const subscription = await Subscription.create({
      user: userId,
      plan: planType,
      planId,
      price,
      startDate,
      endDate,
      paymentId,
      paymentMethod: 'razorpay',
      transactionId: paymentId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      status: 'active'
    });

    // Create payment record
    const payment = await Payment.create({
      user: userId,
      subscription: subscription._id,
      amount: price,
      currency: 'INR',
      plan: planType,
      planId,
      paymentMethod: 'razorpay',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      status: 'success'
    });

    // Update user subscription status
    await User.findByIdAndUpdate(userId, {
      'subscription.isActive': true,
      'subscription.planType': planType,
      'subscription.expiryDate': endDate
    });

    // If user had previous subscription, mark it as cancelled
    if (existingSubscription && existingSubscription._id.toString() !== subscription._id.toString()) {
      existingSubscription.status = 'cancelled';
      await existingSubscription.save();
    }

    res.json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      data: {
        subscription,
        payment
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
  }
};

// @desc    Get user subscription status
// @route   GET /api/user/payment/subscription-status
// @access  Private
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get active subscription
    const subscription = await Subscription.findOne({
      user: userId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          isActive: false,
          subscription: null
        }
      });
    }

    // Check if subscription expired
    const now = new Date();
    if (now > subscription.endDate) {
      subscription.status = 'expired';
      await subscription.save();
      
      await User.findByIdAndUpdate(userId, {
        'subscription.isActive': false,
        'subscription.planType': null,
        'subscription.expiryDate': null
      });

      return res.json({
        success: true,
        data: {
          isActive: false,
          subscription: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        isActive: true,
        subscription: {
          id: subscription._id,
          plan: subscription.plan,
          planId: subscription.planId,
          price: subscription.price,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          status: subscription.status
        }
      }
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription status'
    });
  }
};

// @desc    Get payment history
// @route   GET /api/user/payment/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ user: userId })
      .populate('subscription', 'plan planId price startDate endDate status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ user: userId });

    res.json({
      success: true,
      data: payments,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment history'
    });
  }
};


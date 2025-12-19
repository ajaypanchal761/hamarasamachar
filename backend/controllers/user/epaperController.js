import Epaper from '../../models/Epaper.js';
import Subscription from '../../models/Subscription.js';
import User from '../../models/User.js';

// @desc    Get all epapers
// @route   GET /api/user/epaper
// @access  Public (but subscription check for PDF access)
export const getAllEpapers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const epapers = await Epaper.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Epaper.countDocuments();

    // Check if user has active subscription (optional - for frontend to show/hide lock icons)
    let hasActiveSubscription = false;
    if (req.user) {
      const subscription = await Subscription.findOne({
        user: req.user._id,
        status: 'active',
        endDate: { $gt: new Date() }
      });
      hasActiveSubscription = !!subscription;
    }

    res.json({
      success: true,
      data: epapers,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      hasActiveSubscription // Include subscription status for frontend
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get epaper by ID
// @route   GET /api/user/epaper/:id
// @access  Public (but subscription required for PDF access)
export const getEpaperById = async (req, res) => {
  try {
    const epaper = await Epaper.findById(req.params.id);

    if (!epaper) {
      return res.status(404).json({
        success: false,
        message: 'E-paper not found'
      });
    }

    // User is authenticated (required by route middleware)
    // Check if user has active subscription
    const subscription = await Subscription.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access e-paper',
        requiresSubscription: true
      });
    }

    // Increment views
    epaper.views += 1;
    await epaper.save();

    res.json({
      success: true,
      data: epaper
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


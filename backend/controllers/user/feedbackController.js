import Feedback from '../../models/Feedback.js';

// @desc    Get user's own feedbacks
// @route   GET /api/user/feedback/me
// @access  Private
export const getUserFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create feedback
// @route   POST /api/user/feedback
// @access  Public (can be anonymous)
export const createFeedback = async (req, res) => {
  try {
    const { type, text } = req.body;

    if (!type || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type and text'
      });
    }

    if (!['App Feedback', 'News Feedback'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback type'
      });
    }

    const feedback = await Feedback.create({
      type,
      text,
      user: req.user ? req.user._id : null,
      status: 'New'
    });

    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


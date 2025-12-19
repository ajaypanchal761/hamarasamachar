import Feedback from '../../models/Feedback.js';

// @desc    Get all feedbacks
// @route   GET /api/admin/feedback
// @access  Private (Admin)
export const getAllFeedbacks = async (req, res) => {
  try {
    const { type, status, search, startDate, endDate, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(query)
      .populate('user', 'phone name userId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(query);

    // Transform feedbacks to include userId in user object
    const transformedFeedbacks = feedbacks.map(feedback => {
      const fbObj = feedback.toObject();
      if (fbObj.user) {
        fbObj.user = {
          ...fbObj.user,
          id: fbObj.user.userId || fbObj.user._id?.toString() || null,
          userId: fbObj.user.userId || fbObj.user._id?.toString() || null
        };
      }
      return {
        ...fbObj,
        id: fbObj._id.toString()
      };
    });

    res.json({
      success: true,
      data: transformedFeedbacks,
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

// @desc    Get feedback by ID
// @route   GET /api/admin/feedback/:id
// @access  Private (Admin)
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('user', 'phone name userId');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    const fbObj = feedback.toObject();
    if (fbObj.user) {
      fbObj.user = {
        ...fbObj.user,
        id: fbObj.user.userId || fbObj.user._id?.toString() || null,
        userId: fbObj.user.userId || fbObj.user._id?.toString() || null
      };
    }

    res.json({
      success: true,
      data: {
        ...fbObj,
        id: fbObj._id.toString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update feedback status
// @route   PATCH /api/admin/feedback/:id/status
// @access  Private (Admin)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['New', 'Read', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    feedback.status = status;
    await feedback.save();

    res.json({
      success: true,
      message: 'Feedback status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private (Admin)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread feedback count
// @route   GET /api/admin/feedback/unread-count
// @access  Private (Admin)
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Feedback.countDocuments({ status: 'New' });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


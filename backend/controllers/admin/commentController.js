import Comment from '../../models/Comment.js';
import News from '../../models/News.js';

// @desc    Get all comments
// @route   GET /api/admin/comments
// @access  Private (Admin)
export const getAllComments = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

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

    const comments = await Comment.find(query)
      .populate('news', 'title')
      .populate('user', 'phone name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: comments,
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

// @desc    Update comment status
// @route   PATCH /api/admin/comments/:id/status
// @access  Private (Admin)
export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.status = status;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/admin/comments/:id
// @access  Private (Admin)
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reply to comment
// @route   POST /api/admin/comments/:id/reply
// @access  Private (Admin)
export const replyToComment = async (req, res) => {
  try {
    const { replyText } = req.body;

    if (!replyText) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reply text'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    comment.replies.push({
      text: replyText,
      user: {
        name: req.admin.name,
        role: req.admin.role
      },
      date: new Date()
    });

    await comment.save();

    res.json({
      success: true,
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get comment statistics
// @route   GET /api/admin/comments/stats
// @access  Private (Admin)
export const getCommentStats = async (req, res) => {
  try {
    const total = await Comment.countDocuments();
    const approved = await Comment.countDocuments({ status: 'Approved' });
    const rejected = await Comment.countDocuments({ status: 'Rejected' });
    const pending = await Comment.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      data: {
        total,
        approved,
        rejected,
        pending
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


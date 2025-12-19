import Comment from '../../models/Comment.js';
import News from '../../models/News.js';
import User from '../../models/User.js';

// @desc    Get comments for a news
// @route   GET /api/user/comments/news/:newsId
// @access  Public
export const getCommentsByNews = async (req, res) => {
  try {
    const { newsId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verify news exists
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find({
      news: newsId,
      status: 'Approved'
    })
      .populate('user', 'phone name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({
      news: newsId,
      status: 'Approved'
    });

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

// @desc    Create comment
// @route   POST /api/user/comments
// @access  Private
export const createComment = async (req, res) => {
  try {
    const { newsId, text } = req.body;

    if (!newsId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide news ID and comment text'
      });
    }

    // Verify news exists
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const comment = await Comment.create({
      text,
      news: newsId,
      user: req.user._id,
      status: 'Pending'
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.comments': 1 } });

    res.status(201).json({
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


import Bookmark from '../../models/Bookmark.js';
import News from '../../models/News.js';
import User from '../../models/User.js';

// @desc    Get user's bookmarks
// @route   GET /api/user/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'news',
        select: 'title featuredImage videoUrl publishDate category district isBreakingNews content author views contentSections',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out bookmarks with null news (news that may have been deleted)
    // and clean up orphaned bookmarks
    const validBookmarks = [];
    const orphanedBookmarkIds = [];
    
    for (const bookmark of bookmarks) {
      if (bookmark.news && bookmark.news !== null) {
        validBookmarks.push(bookmark.news);
      } else {
        // Mark for deletion if news is null
        orphanedBookmarkIds.push(bookmark._id);
      }
    }

    // Clean up orphaned bookmarks in background (don't await)
    if (orphanedBookmarkIds.length > 0) {
      Bookmark.deleteMany({ _id: { $in: orphanedBookmarkIds } })
        .catch(err => console.error('Error cleaning up orphaned bookmarks:', err));
    }

    const total = await Bookmark.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: validBookmarks,
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

// @desc    Add bookmark
// @route   POST /api/user/bookmarks
// @access  Private
export const addBookmark = async (req, res) => {
  try {
    const { newsId } = req.body;

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide news ID'
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

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      news: newsId
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'News already bookmarked'
      });
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      news: newsId
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.bookmarks': 1 } });

    res.status(201).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/user/bookmarks/:newsId
// @access  Private
export const removeBookmark = async (req, res) => {
  try {
    const { newsId } = req.params;

    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user._id,
      news: newsId
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.bookmarks': -1 } });

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if news is bookmarked
// @route   GET /api/user/bookmarks/check/:newsId
// @access  Private
export const checkBookmark = async (req, res) => {
  try {
    const { newsId } = req.params;

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.json({
        success: true,
        isBookmarked: false,
        message: 'User not authenticated'
      });
    }

    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      news: newsId
    });

    res.json({
      success: true,
      isBookmarked: !!bookmark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


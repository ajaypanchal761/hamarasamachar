import Rating from '../../models/Rating.js';

// @desc    Get all ratings
// @route   GET /api/admin/ratings
// @access  Private (Admin)
export const getAllRatings = async (req, res) => {
  try {
    const { rating, search, startDate, endDate, sortBy, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (rating && rating !== 'All') {
      query.rating = parseInt(rating);
    }

    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: 'i' } }
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

    // Build sort
    let sort = {};
    if (sortBy === 'rating') {
      sort = { rating: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    const ratings = await Rating.find(query)
      .populate('user', 'phone name userId')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rating.countDocuments(query);

    // Transform ratings to include userId in user object
    const transformedRatings = ratings.map(rating => {
      const ratingObj = rating.toObject();
      if (ratingObj.user) {
        ratingObj.user = {
          ...ratingObj.user,
          id: ratingObj.user.userId || ratingObj.user._id?.toString() || null,
          userId: ratingObj.user.userId || ratingObj.user._id?.toString() || null
        };
      }
      return {
        ...ratingObj,
        id: ratingObj._id.toString()
      };
    });

    res.json({
      success: true,
      data: transformedRatings,
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

// @desc    Get rating statistics
// @route   GET /api/admin/ratings/stats
// @access  Private (Admin)
export const getRatingStats = async (req, res) => {
  try {
    const ratings = await Rating.find();
    const total = ratings.length;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    const avg = total > 0 ? (sum / total).toFixed(1) : 0;

    // Recent 5
    const recent = await Rating.find()
      .populate('user', 'phone name userId')
      .sort({ createdAt: -1 })
      .limit(5);

    // Transform recent ratings to include userId
    const transformedRecent = recent.map(rating => {
      const ratingObj = rating.toObject();
      if (ratingObj.user) {
        ratingObj.user = {
          ...ratingObj.user,
          id: ratingObj.user.userId || ratingObj.user._id?.toString() || null,
          userId: ratingObj.user.userId || ratingObj.user._id?.toString() || null
        };
      }
      return {
        ...ratingObj,
        id: ratingObj._id.toString()
      };
    });

    res.json({
      success: true,
      data: {
        average: parseFloat(avg),
        total,
        recent: transformedRecent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add reply to rating
// @route   POST /api/admin/ratings/:id/reply
// @access  Private (Admin)
export const addReply = async (req, res) => {
  try {
    const { replyText } = req.body;

    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    rating.reply = replyText || '';
    await rating.save();

    res.json({
      success: true,
      data: rating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete rating
// @route   DELETE /api/admin/ratings/:id
// @access  Private (Admin)
export const deleteRating = async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }

    await rating.deleteOne();

    res.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


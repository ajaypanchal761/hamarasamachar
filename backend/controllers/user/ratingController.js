import Rating from '../../models/Rating.js';

// @desc    Create or update rating
// @route   POST /api/user/ratings
// @access  Private
export const createRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)'
      });
    }

    // Check if user already rated
    let userRating = await Rating.findOne({ user: req.user._id });

    if (userRating) {
      // Update existing rating
      userRating.rating = rating;
      if (comment !== undefined) userRating.comment = comment;
      await userRating.save();
    } else {
      // Create new rating
      userRating = await Rating.create({
        rating,
        comment: comment || '',
        user: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      data: userRating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's rating
// @route   GET /api/user/ratings/me
// @access  Private
export const getMyRating = async (req, res) => {
  try {
    const rating = await Rating.findOne({ user: req.user._id });

    res.json({
      success: true,
      data: rating || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


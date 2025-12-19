import News from '../../models/News.js';
import Category from '../../models/Category.js';
import Banner from '../../models/Banner.js';

// @desc    Get all news (public)
// @route   GET /api/user/news
// @access  Public
export const getAllNews = async (req, res) => {
  try {
    const { category, district, page = 1, limit = 20, isBreakingNews } = req.query;

    // Build query
    const query = { status: 'published' };

    // Logic: Breaking news items appear in BOTH breaking news section AND their category section
    // When isBreakingNews=true: Show all breaking news (from any category)
    // When category is provided: Show news from that category (including breaking news items from that category)
    
    // More robust check for isBreakingNews parameter (handles string 'true', boolean true, or '1')
    const isBreakingNewsFilter = isBreakingNews === 'true' || isBreakingNews === true || isBreakingNews === '1';
    
    if (isBreakingNewsFilter) {
      // Breaking news section: Show all breaking news from any category
      query.isBreakingNews = true;
      // Explicitly don't filter by category when showing breaking news
      // (even if category parameter is accidentally passed)
    } else if (category) {
      // Category section: Show news from this specific category
      // Breaking news items from this category will also appear here (no exclusion)
      const categoryDoc = await Category.findOne({ 
        $or: [
          { slug: category },
          { name: category }
        ],
        status: 'active' // Only active categories
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
        // Note: Breaking news items are NOT excluded here - they appear in both sections
      } else {
        // If category not found, return empty result (don't show all news)
        return res.json({
          success: true,
          data: [],
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit)
        });
      }
    }

    if (district && district !== 'all' && district !== 'सभी जिले') {
      query.district = district;
    }

    // Debug logging (can be removed in production if not needed)
    console.log('News Query Params:', { category, district, page, limit, isBreakingNews, isBreakingNewsFilter });
    console.log('MongoDB Query:', JSON.stringify(query, null, 2));

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.find(query)
      .populate('category', 'name slug icon color')
      .select('-content')
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    console.log(`Found ${total} news items matching query`);

    res.json({
      success: true,
      data: news,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get news by ID
// @route   GET /api/user/news/:id
// @access  Public
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('category', 'name slug icon color');

    if (!news || news.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Increment views
    news.views += 1;
    await news.save();

    // Update user stats if authenticated
    if (req.user) {
      const User = (await import('../../models/User.js')).default;
      await User.findByIdAndUpdate(req.user._id, { $inc: { 'stats.views': 1 } });
    }

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get breaking news
// @route   GET /api/user/news/breaking
// @access  Public
export const getBreakingNews = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const news = await News.find({
      status: 'published',
      isBreakingNews: true
    })
      .populate('category', 'name slug')
      .select('-content')
      .sort({ publishDate: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get banners by position
// @route   GET /api/user/banners/:position
// @access  Public
export const getBanners = async (req, res) => {
  try {
    const { position } = req.params;
    const { category } = req.query;

    const query = {
      position,
      status: 'active'
    };

    if (category) {
      query.$or = [
        { category: category },
        { category: '' },
        { category: { $exists: false } }
      ];
    }

    const banners = await Banner.find(query).sort({ order: 1 });

    res.json({
      success: true,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


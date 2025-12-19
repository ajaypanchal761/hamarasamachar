import Category from '../../models/Category.js';

// @desc    Get all active categories (public)
// @route   GET /api/user/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    // Get only active categories, sorted by order
    const categories = await Category.find({ status: 'active' })
      .select('name slug icon color order description')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/user/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ 
      slug: slug,
      status: 'active'
    }).select('name slug icon color order description');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


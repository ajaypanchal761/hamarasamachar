import Category from '../../models/Category.js';

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });

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

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Private (Admin)
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

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

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private (Admin)
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || '',
      color: color || '',
      order: order || 0,
      status: status || 'active'
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Category with this ${field} already exists. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category'
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, color, order, status } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name && name.trim()) {
      category.name = name.trim();
      // Clear slug so it regenerates from new name
      category.slug = '';
    }
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (color !== undefined) category.color = color;
    if (order !== undefined) category.order = order;
    if (status) category.status = status;

    await category.save();

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Category with this ${field} already exists. Please use a different ${field}.`
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category'
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has news
    if (category.newsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing news'
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reorder categories
// @route   PUT /api/admin/categories/reorder
// @access  Private (Admin)
export const reorderCategories = async (req, res) => {
  try {
    const { categoryIds } = req.body;

    if (!categoryIds || !Array.isArray(categoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category IDs array'
      });
    }

    // Update order for each category
    const updatePromises = categoryIds.map((id, index) => {
      return Category.findByIdAndUpdate(id, { order: index + 1 });
    });

    await Promise.all(updatePromises);

    const categories = await Category.find().sort({ order: 1 });

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


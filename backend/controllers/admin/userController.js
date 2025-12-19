import User from '../../models/User.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
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

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-otp');

    const total = await User.countDocuments(query);

    // Transform users to include userId as id
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();
      return {
        ...userObj,
        id: userObj.userId || userObj._id.toString(), // Use userId if available, fallback to _id
        userId: userObj.userId || userObj._id.toString() // Explicit userId field
      };
    });

    res.json({
      success: true,
      data: transformedUsers,
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

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-otp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userObj = user.toObject();
    res.json({
      success: true,
      data: {
        ...userObj,
        id: userObj.userId || userObj._id.toString(), // Use userId if available, fallback to _id
        userId: userObj.userId || userObj._id.toString() // Explicit userId field
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { name, gender, birthdate, selectedCategory, status } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (gender !== undefined) user.gender = gender;
    if (birthdate) user.birthdate = birthdate;
    if (selectedCategory) user.selectedCategory = selectedCategory;
    if (status) user.status = status;

    await user.save();

    const userObj = user.toObject();
    res.json({
      success: true,
      data: {
        ...userObj,
        id: userObj.userId || userObj._id.toString(), // Use userId if available, fallback to _id
        userId: userObj.userId || userObj._id.toString() // Explicit userId field
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Active', 'Blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk update user status
// @route   PATCH /api/admin/users/bulk-status
// @access  Private (Admin)
export const bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user IDs'
      });
    }

    if (!['Active', 'Blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    await User.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    res.json({
      success: true,
      message: 'Users status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk delete users
// @route   DELETE /api/admin/users/bulk-delete
// @access  Private (Admin)
export const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user IDs'
      });
    }

    await User.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: 'Users deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin)
export const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ status: 'Active' });
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        total,
        active,
        newUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


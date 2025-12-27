import ServiceInformation from '../../models/ServiceInformation.js';
import UserServiceInformation from '../../models/UserServiceInformation.js';
import User from '../../models/User.js';

// @desc    Get all service information
// @route   GET /api/admin/service-information
// @access  Private (Admin)
export const getAllServiceInformation = async (req, res) => {
  try {
    const { search, startDate, endDate, page = 1, limit = 1000 } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
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

    const serviceInformations = await ServiceInformation.find(query)
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ServiceInformation.countDocuments(query);

    // Transform data
    const transformedData = serviceInformations.map(info => ({
      id: info._id.toString(),
      title: info.title,
      message: info.message,
      createdBy: info.createdBy,
      createdAt: info.createdAt,
      sentToAll: info.sentToAll
    }));

    res.json({
      success: true,
      data: transformedData,
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

// @desc    Get service information by ID
// @route   GET /api/admin/service-information/:id
// @access  Private (Admin)
export const getServiceInformationById = async (req, res) => {
  try {
    const serviceInfo = await ServiceInformation.findById(req.params.id)
      .populate('createdBy', 'name username');

    if (!serviceInfo) {
      return res.status(404).json({
        success: false,
        message: 'Service information not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: serviceInfo._id.toString(),
        title: serviceInfo.title,
        message: serviceInfo.message,
        createdBy: serviceInfo.createdBy,
        createdAt: serviceInfo.createdAt,
        sentToAll: serviceInfo.sentToAll
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new service information
// @route   POST /api/admin/service-information
// @access  Private (Admin)
export const createServiceInformation = async (req, res) => {
  try {
    const { title, message, sentToAll = true } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Create service information
    const serviceInfo = await ServiceInformation.create({
      title,
      message,
      createdBy: req.admin._id,
      sentToAll
    });

    // If sentToAll is true, create UserServiceInformation entries for all users
    if (sentToAll) {
      try {
        const users = await User.find({}, '_id');
        const userServiceInfoEntries = users.map(user => ({
          user: user._id,
          serviceInformation: serviceInfo._id,
          isRead: false,
          isDeleted: false
        }));

        // Use individual inserts with error handling to avoid duplicates
        for (const entry of userServiceInfoEntries) {
          try {
            await UserServiceInformation.create(entry);
          } catch (insertError) {
            // Ignore duplicate key errors (user might already have this service info)
            if (insertError.code !== 11000) {
              console.error('Error creating user service info entry:', insertError);
            }
          }
        }
      } catch (bulkError) {
        console.error('Error in bulk user service info creation:', bulkError);
        // Don't fail the entire operation if this part fails
      }
    }

    const populatedInfo = await ServiceInformation.findById(serviceInfo._id)
      .populate('createdBy', 'name username');

    res.status(201).json({
      success: true,
      data: {
        id: populatedInfo._id.toString(),
        title: populatedInfo.title,
        message: populatedInfo.message,
        createdBy: populatedInfo.createdBy,
        createdAt: populatedInfo.createdAt,
        sentToAll: populatedInfo.sentToAll
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update service information
// @route   PUT /api/admin/service-information/:id
// @access  Private (Admin)
export const updateServiceInformation = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    const serviceInfo = await ServiceInformation.findById(req.params.id);

    if (!serviceInfo) {
      return res.status(404).json({
        success: false,
        message: 'Service information not found'
      });
    }

    serviceInfo.title = title;
    serviceInfo.message = message;
    await serviceInfo.save();

    res.json({
      success: true,
      message: 'Service information updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete service information
// @route   DELETE /api/admin/service-information/:id
// @access  Private (Admin)
export const deleteServiceInformation = async (req, res) => {
  try {
    const serviceInfo = await ServiceInformation.findById(req.params.id);

    if (!serviceInfo) {
      return res.status(404).json({
        success: false,
        message: 'Service information not found'
      });
    }

    // Delete all related UserServiceInformation entries
    await UserServiceInformation.deleteMany({ serviceInformation: req.params.id });

    // Delete the service information
    await serviceInfo.deleteOne();

    res.json({
      success: true,
      message: 'Service information deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

import ServiceInformation from '../../models/ServiceInformation.js';
import UserServiceInformation from '../../models/UserServiceInformation.js';

// @desc    Get user's service information
// @route   GET /api/user/service-information
// @access  Private
export const getUserServiceInformation = async (req, res) => {
  try {
    // Get all service information entries for this user that are not deleted
    const userServiceInfo = await UserServiceInformation.find({
      user: req.user._id,
      isDeleted: false
    })
    .populate({
      path: 'serviceInformation',
      select: 'title message createdAt',
      populate: {
        path: 'createdBy',
        select: 'name username'
      }
    })
    .sort({ createdAt: -1 });

    // Transform the data to match frontend expectations
    const transformedData = userServiceInfo
      .filter(item => item.serviceInformation) // Filter out any null references
      .map(item => ({
        id: item.serviceInformation._id.toString(),
        title: item.serviceInformation.title,
        message: item.serviceInformation.message,
        createdAt: item.serviceInformation.createdAt,
        isRead: item.isRead,
        userServiceInfoId: item._id.toString()
      }));

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user's service information (mark as deleted)
// @route   DELETE /api/user/service-information/:id
// @access  Private
export const deleteUserServiceInformation = async (req, res) => {
  try {
    const serviceInfoId = req.params.id;

    // Find the UserServiceInformation entry for this user and service information
    const userServiceInfo = await UserServiceInformation.findOne({
      user: req.user._id,
      serviceInformation: serviceInfoId,
      isDeleted: false
    });

    if (!userServiceInfo) {
      return res.status(404).json({
        success: false,
        message: 'Service information not found or already deleted'
      });
    }

    // Mark as deleted instead of actually deleting
    userServiceInfo.isDeleted = true;
    await userServiceInfo.save();

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

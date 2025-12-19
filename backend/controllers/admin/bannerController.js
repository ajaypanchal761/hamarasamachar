import Banner from '../../models/Banner.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

// @desc    Get all banners
// @route   GET /api/admin/banners
// @access  Private (Admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ position: 1, order: 1 });

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

// @desc    Get banner by ID
// @route   GET /api/admin/banners/:id
// @access  Private (Admin)
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create banner
// @route   POST /api/admin/banners
// @access  Private (Admin)
export const createBanner = async (req, res) => {
  try {
    const { title, link, position, category, order, status, target } = req.body;

    let imageUrl = '';
    let videoUrl = '';

    // Handle single file upload (image or video)
    if (req.file) {
      // Check if it's a video file
      const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video/');
      const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      const isVideoByExt = videoExts.includes(fileExt);
      
      if (isVideo || isVideoByExt) {
        // Upload video to Cloudinary
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/banners', 'video');
        videoUrl = result.secure_url;
      } else {
        // Upload image to Cloudinary
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/banners', 'image');
        imageUrl = result.secure_url;
      }
    }

    // Validate that at least image or video is provided
    if (!imageUrl && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image or video file'
      });
    }

    const banner = await Banner.create({
      title: title || 'Banner',
      imageUrl,
      videoUrl,
      link: link || '',
      position,
      category: category || '',
      order: order || 0,
      status: status || 'active',
      target: target || '_self'
    });

    res.status(201).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update banner
// @route   PUT /api/admin/banners/:id
// @access  Private (Admin)
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    const { title, link, position, category, order, status, target } = req.body;

    // Handle single file upload (image or video)
    if (req.file) {
      // Delete old media from Cloudinary
      if (banner.imageUrl) {
        try {
          const publicId = banner.imageUrl.split('/').pop().split('.')[0];
          await deleteFromCloudinary(`hamarasamachar/banners/${publicId}`);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      if (banner.videoUrl) {
        try {
          const publicId = banner.videoUrl.split('/').pop().split('.')[0];
          await deleteFromCloudinary(`hamarasamachar/banners/${publicId}`, 'video');
        } catch (error) {
          console.error('Error deleting old video:', error);
        }
      }

      // Check if it's a video file
      const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video/');
      const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      const isVideoByExt = videoExts.includes(fileExt);
      
      if (isVideo || isVideoByExt) {
        // Upload video to Cloudinary
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/banners', 'video');
        banner.videoUrl = result.secure_url;
        banner.imageUrl = ''; // Clear imageUrl if video is uploaded
      } else {
        // Upload image to Cloudinary
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/banners', 'image');
        banner.imageUrl = result.secure_url;
        banner.videoUrl = ''; // Clear videoUrl if image is uploaded
      }
    }

    if (title) banner.title = title;
    if (link !== undefined) banner.link = link;
    if (position) banner.position = position;
    if (category !== undefined) banner.category = category;
    if (order !== undefined) banner.order = order;
    if (status) banner.status = status;
    if (target) banner.target = target;

    await banner.save();

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete banner
// @route   DELETE /api/admin/banners/:id
// @access  Private (Admin)
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete media from Cloudinary
    if (banner.imageUrl) {
      try {
        const publicId = banner.imageUrl.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`hamarasamachar/banners/${publicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    if (banner.videoUrl) {
      try {
        const publicId = banner.videoUrl.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`hamarasamachar/banners/${publicId}`, 'video');
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }

    await banner.deleteOne();

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get banners by position
// @route   GET /api/admin/banners/position/:position
// @access  Private (Admin)
export const getBannersByPosition = async (req, res) => {
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


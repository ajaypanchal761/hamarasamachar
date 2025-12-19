import mongoose from 'mongoose';
import News from '../../models/News.js';
import Category from '../../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

// @desc    Get all news
// @route   GET /api/admin/news
// @access  Private (Admin)
export const getAllNews = async (req, res) => {
  try {
    const { status, category, author, dateRange, search, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category) {
      // Check if category is ObjectId or name
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ name: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    if (author) {
      query.author = { $regex: author, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(' to ');
      if (startDate && endDate) {
        query.publishDate = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.find(query)
      .populate('category', 'name')
      .populate('createdBy', 'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: news,
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

// @desc    Get news by ID
// @route   GET /api/admin/news/:id
// @access  Private (Admin)
export const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('category', 'name')
      .populate('createdBy', 'name username');

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
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

// @desc    Create news
// @route   POST /api/admin/news
// @access  Private (Admin)
export const createNews = async (req, res) => {
  try {
    const {
      title,
      category,
      district,
      videoUrl,
      isBreakingNews,
      content,
      author,
      publishDate,
      status,
      metaDescription,
      tags
    } = req.body;

    // Upload featured image or video if provided
    let featuredImage = '';
    let uploadedVideoUrl = '';
    
    if (req.file) {
      // Check if it's a video file
      const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video/');
      const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      const isVideoByExt = videoExts.includes(fileExt);
      
      if (isVideo || isVideoByExt) {
        // Upload video
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/news', 'video');
        uploadedVideoUrl = result.secure_url;
      } else {
        // Upload image
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/news', 'image');
        featuredImage = result.secure_url;
      }
    }

    // Parse tags if string
    const tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags || [];

    // Handle category - if not ObjectId, find by name or create default mapping
    let categoryId = category;
    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      // Map default category names to actual category names
      const categoryNameMap = {
        'politics': 'राजनीति',
        'sports': 'खेलकूद',
        'technology': 'टेक्नोलॉजी',
        'entertainment': 'मनोरंजन',
        'rajasthan': 'राजस्थान',
        'other': 'अन्य'
      };
      
      const categoryName = categoryNameMap[category] || category;
      const categoryDoc = await Category.findOne({ name: categoryName });
      
      if (categoryDoc) {
        categoryId = categoryDoc._id;
      } else {
        // If category doesn't exist, try to find or create
        // For now, return error if category not found
        return res.status(400).json({
          success: false,
          message: `Category "${categoryName}" not found. Please create the category first.`
        });
      }
    }

    const news = await News.create({
      title,
      category: categoryId,
      district: district || '',
      featuredImage,
      videoUrl: uploadedVideoUrl || videoUrl || '',
      isBreakingNews: isBreakingNews === 'true' || isBreakingNews === true,
      content,
      author: author || req.admin.name,
      publishDate: publishDate || new Date(),
      status: status || 'draft',
      metaDescription: metaDescription || '',
      tags: tagsArray,
      createdBy: req.admin._id
    });

    // Update category news count
    await Category.findByIdAndUpdate(categoryId, { $inc: { newsCount: 1 } });

    res.status(201).json({
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

// @desc    Update news
// @route   PUT /api/admin/news/:id
// @access  Private (Admin)
export const updateNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    const {
      title,
      category,
      district,
      videoUrl,
      isBreakingNews,
      content,
      author,
      publishDate,
      status,
      metaDescription,
      tags
    } = req.body;

    // Handle featured image or video upload
    if (req.file) {
      // Check if it's a video file
      const isVideo = req.file.mimetype && req.file.mimetype.startsWith('video/');
      const videoExts = ['mp4', 'webm', 'ogg', 'mov'];
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      const isVideoByExt = videoExts.includes(fileExt);
      
      if (isVideo || isVideoByExt) {
        // Delete old video if exists
        if (news.videoUrl) {
          try {
            const publicId = news.videoUrl.split('/').pop().split('.')[0];
            await deleteFromCloudinary(`hamarasamachar/news/${publicId}`);
          } catch (error) {
            console.error('Error deleting old video:', error);
          }
        }
        
        // Upload new video
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/news', 'video');
        news.videoUrl = result.secure_url;
      } else {
        // Delete old image if exists
        if (news.featuredImage) {
          try {
            const publicId = news.featuredImage.split('/').pop().split('.')[0];
            await deleteFromCloudinary(`hamarasamachar/news/${publicId}`);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
        
        // Upload new image
        const result = await uploadToCloudinary(req.file, 'hamarasamachar/news', 'image');
        news.featuredImage = result.secure_url;
      }
    }

    // Update category news count if category changed
    if (category) {
      let categoryId = category;
      
      // Handle category - if not ObjectId, find by name
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const categoryNameMap = {
          'politics': 'राजनीति',
          'sports': 'खेलकूद',
          'technology': 'टेक्नोलॉजी',
          'entertainment': 'मनोरंजन',
          'rajasthan': 'राजस्थान',
          'other': 'अन्य'
        };
        
        const categoryName = categoryNameMap[category] || category;
        const categoryDoc = await Category.findOne({ name: categoryName });
        
        if (categoryDoc) {
          categoryId = categoryDoc._id;
        } else {
          return res.status(400).json({
            success: false,
            message: `Category "${categoryName}" not found.`
          });
        }
      }
      
      if (categoryId.toString() !== news.category.toString()) {
        await Category.findByIdAndUpdate(news.category, { $inc: { newsCount: -1 } });
        await Category.findByIdAndUpdate(categoryId, { $inc: { newsCount: 1 } });
        news.category = categoryId;
      }
    }

    if (title !== undefined) news.title = title;
    if (district !== undefined) news.district = district;
    if (videoUrl !== undefined) news.videoUrl = videoUrl;
    if (isBreakingNews !== undefined) news.isBreakingNews = isBreakingNews === 'true' || isBreakingNews === true;
    if (content !== undefined) news.content = content; // Always update content if provided, even if empty
    if (author !== undefined) news.author = author;
    if (publishDate !== undefined) news.publishDate = publishDate;
    if (status !== undefined) news.status = status;
    if (metaDescription !== undefined) news.metaDescription = metaDescription;
    if (tags) {
      const tagsArray = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
      news.tags = tagsArray;
    }

    await news.save();

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

// @desc    Delete news
// @route   DELETE /api/admin/news/:id
// @access  Private (Admin)
export const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Delete featured image from Cloudinary
    if (news.featuredImage) {
      try {
        const publicId = news.featuredImage.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`hamarasamachar/news/${publicId}`);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    // Update category news count
    await Category.findByIdAndUpdate(news.category, { $inc: { newsCount: -1 } });

    await news.deleteOne();

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Bulk delete news
// @route   DELETE /api/admin/news/bulk-delete
// @access  Private (Admin)
export const bulkDeleteNews = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide news IDs'
      });
    }

    const newsItems = await News.find({ _id: { $in: ids } });

    // Delete images and update category counts
    for (const news of newsItems) {
      if (news.featuredImage) {
        try {
          const publicId = news.featuredImage.split('/').pop().split('.')[0];
          await deleteFromCloudinary(`hamarasamachar/news/${publicId}`);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
      await Category.findByIdAndUpdate(news.category, { $inc: { newsCount: -1 } });
    }

    await News.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


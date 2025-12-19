import Epaper from '../../models/Epaper.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUpload.js';

// @desc    Get all epapers
// @route   GET /api/admin/epaper
// @access  Private (Admin)
export const getAllEpapers = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 25 } = req.query;

    // Build query
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const epapers = await Epaper.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Epaper.countDocuments(query);

    res.json({
      success: true,
      data: epapers,
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

// @desc    Upload epaper
// @route   POST /api/admin/epaper
// @access  Private (Admin)
export const uploadEpaper = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide date'
      });
    }

    // Check if files are uploaded
    const pdfFile = req.files && req.files['file'] ? req.files['file'][0] : null;
    const coverImageFile = req.files && req.files['coverImage'] ? req.files['coverImage'][0] : null;

    if (!pdfFile) {
      return res.status(400).json({
        success: false,
        message: 'Please upload PDF file'
      });
    }

    // Check if epaper for this date already exists
    const existingEpaper = await Epaper.findOne({ date: new Date(date) });
    if (existingEpaper) {
      return res.status(400).json({
        success: false,
        message: 'E-paper for this date already exists'
      });
    }

    // Upload PDF to Cloudinary
    const pdfResult = await uploadToCloudinary(pdfFile, 'hamarasamachar/epaper', 'raw');

    // Upload cover image to Cloudinary if provided
    let coverUrl = '';
    if (coverImageFile) {
      try {
        const coverResult = await uploadToCloudinary(coverImageFile, 'hamarasamachar/epaper/covers', 'image');
        coverUrl = coverResult.secure_url;
      } catch (coverError) {
        console.error('Error uploading cover image:', coverError);
        // Continue without cover image if upload fails
        coverUrl = '';
      }
    }

    const epaper = await Epaper.create({
      date: new Date(date),
      pdfUrl: pdfResult.secure_url,
      coverUrl: coverUrl,
      fileName: pdfFile.originalname,
      views: 0
    });

    res.status(201).json({
      success: true,
      data: epaper
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete epaper
// @route   DELETE /api/admin/epaper/:id
// @access  Private (Admin)
export const deleteEpaper = async (req, res) => {
  try {
    const epaper = await Epaper.findById(req.params.id);

    if (!epaper) {
      return res.status(404).json({
        success: false,
        message: 'E-paper not found'
      });
    }

    // Delete PDF from Cloudinary
    try {
      const publicId = epaper.pdfUrl.split('/').pop().split('.')[0];
      await deleteFromCloudinary(`hamarasamachar/epaper/${publicId}`);
    } catch (error) {
      console.error('Error deleting PDF:', error);
    }

    // Delete cover image from Cloudinary if exists
    if (epaper.coverUrl) {
      try {
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/.../hamarasamachar/epaper/covers/filename
        const urlParts = epaper.coverUrl.split('/');
        const coversIndex = urlParts.findIndex(part => part === 'covers');
        if (coversIndex !== -1) {
          const publicIdParts = urlParts.slice(coversIndex);
          const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
          await deleteFromCloudinary(publicId, 'image');
        }
      } catch (error) {
        console.error('Error deleting cover image:', error);
      }
    }

    await epaper.deleteOne();

    res.json({
      success: true,
      message: 'E-paper deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


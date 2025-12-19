import multer from 'multer';
import path from 'path';

// Memory storage for multer (files will be uploaded to Cloudinary from memory)
const storage = multer.memoryStorage();

// Custom file filter for e-paper upload (PDF + optional cover image)
const epaperFileFilter = (req, file, cb) => {
  const fieldName = file.fieldname;
  
  if (fieldName === 'file') {
    // PDF file validation
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('PDF file must be in PDF format'), false);
    }
  } else if (fieldName === 'coverImage') {
    // Cover image validation
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (allowedImageTypes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Cover image must be in JPG, PNG, GIF, or WEBP format'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

// E-paper upload middleware (PDF required + optional cover image)
export const uploadEpaperFiles = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max for PDF, 10MB for images (handled by Cloudinary)
  },
  fileFilter: epaperFileFilter
}).fields([
  { name: 'file', maxCount: 1 }, // PDF file (required)
  { name: 'coverImage', maxCount: 1 } // Cover image (optional)
]);


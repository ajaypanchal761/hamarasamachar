import multer from 'multer';
import path from 'path';

// Memory storage for multer (files will be uploaded to Cloudinary from memory)
const storage = multer.memoryStorage();

// Image upload middleware
export const uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// PDF upload middleware
export const uploadPDF = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Multiple images upload
export const uploadMultipleImages = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(',');
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  }
});

// Video upload middleware
export const uploadVideo = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const allowedExts = ['mp4', 'webm', 'ogg', 'mov'];
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid video file type. Allowed types: mp4, webm, ogg, mov'), false);
    }
  }
});

// Combined image or video upload
export const uploadMedia = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max
  },
  fileFilter: (req, file, cb) => {
    const imageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(',');
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');
    
    if (imageTypes.includes(fileExt) || videoTypes.includes(file.mimetype) || ['mp4', 'webm', 'ogg', 'mov'].includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: images (jpg, png, gif, webp) or videos (mp4, webm, ogg, mov)'), false);
    }
  }
});


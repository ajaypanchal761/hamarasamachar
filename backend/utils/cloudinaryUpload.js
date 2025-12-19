import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

export const uploadToCloudinary = (file, folder = 'hamarasamachar', resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
    };

    // Don't add transformation options (format, quality) in upload options
    // These should be applied via URL transformations when serving images, not during upload
    // Cloudinary will preserve the original file format and quality during upload

    if (file.buffer) {
      // File from multer memory storage
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Create readable stream from buffer
      const stream = Readable.from(file.buffer);
      stream.pipe(uploadStream);
    } else if (file.path) {
      // File path
      cloudinary.uploader.upload(file.path, uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    } else {
      reject(new Error('Invalid file format'));
    }
  });
};

export const deleteFromCloudinary = (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: resourceType
    };
    cloudinary.uploader.destroy(publicId, options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};


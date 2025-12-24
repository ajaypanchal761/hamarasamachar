import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
const connectCloudinary = async () => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      // Test connection by pinging Cloudinary
      await cloudinary.api.ping();
      } else {
      }
  } catch (error) {
    console.error('Cloudinary Connection Error:', error.message);
  }
};

// Call connection test
connectCloudinary();

export default cloudinary;


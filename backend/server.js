import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/database.js';
import './config/cloudinary.js'; // Initialize Cloudinary connection

// Import routes
import adminAuthRoutes from './routes/admin/authRoutes.js';
import adminUserRoutes from './routes/admin/userRoutes.js';
import adminNewsRoutes from './routes/admin/newsRoutes.js';
import adminCategoryRoutes from './routes/admin/categoryRoutes.js';
import adminBannerRoutes from './routes/admin/bannerRoutes.js';
import adminCommentRoutes from './routes/admin/commentRoutes.js';
import adminFeedbackRoutes from './routes/admin/feedbackRoutes.js';
import adminRatingRoutes from './routes/admin/ratingRoutes.js';
import adminEpaperRoutes from './routes/admin/epaperRoutes.js';
import adminDashboardRoutes from './routes/admin/dashboardRoutes.js';
import adminPlanRoutes from './routes/admin/planRoutes.js';
import adminFranchiseLeadRoutes from './routes/admin/franchiseLeadRoutes.js';

import userAuthRoutes from './routes/user/authRoutes.js';
import userNewsRoutes from './routes/user/newsRoutes.js';
import userCommentRoutes from './routes/user/commentRoutes.js';
import userFeedbackRoutes from './routes/user/feedbackRoutes.js';
import userRatingRoutes from './routes/user/ratingRoutes.js';
import userEpaperRoutes from './routes/user/epaperRoutes.js';
import userBookmarkRoutes from './routes/user/bookmarkRoutes.js';
import userCategoryRoutes from './routes/user/categoryRoutes.js';
import userPaymentRoutes from './routes/user/paymentRoutes.js';
import userPlanRoutes from './routes/user/planRoutes.js';
import userFranchiseLeadRoutes from './routes/user/franchiseLeadRoutes.js';

// Import middleware
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Check TEST OTP Mode status and SMS Hub India connection
(async () => {
  try {
    const { isTestOTPMode } = await import('./utils/otp.js');
    if (isTestOTPMode()) {
      console.log('🧪 TEST OTP MODE ENABLED: Fixed OTP (110211) - No SMS will be sent');
    } else {
      // Test SMS Hub India connection (only if not in test mode)
      try {
        const { default: smsHubIndiaService } = await import('./services/smsHubIndiaService.js');
        const testResult = await smsHubIndiaService.testConnection();
        if (testResult.success) {
          console.log(`SMS Hub India Connected: ${testResult.senderId}`);
        } else {
          console.warn('SMS Hub India: Configuration missing. OTP will be logged to console in development mode.');
        }
      } catch (smsError) {
        console.warn('SMS Hub India: Configuration missing or invalid.');
      }
    }
  } catch (error) {
    console.warn('Error checking OTP mode:', error.message);
  }
})();

// Middleware
app.use(cors({
  origin: [
    'https://hamarasamachar.co.in',
    'https://hamarasamachar.co.in/',
    'https://www.hamarasamachar.co.in',
    // Vercel deployment URLs (add your actual Vercel URL after deployment)
    // 'https://hamarasamachar.vercel.app',
    // 'https://your-project-name.vercel.app',
    // Local development
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Admin Routes
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/news', adminNewsRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/admin/banners', adminBannerRoutes);
app.use('/api/admin/comments', adminCommentRoutes);
app.use('/api/admin/feedback', adminFeedbackRoutes);
app.use('/api/admin/ratings', adminRatingRoutes);
app.use('/api/admin/epaper', adminEpaperRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/plans', adminPlanRoutes);
app.use('/api/admin/franchise-leads', adminFranchiseLeadRoutes);

// User Routes
app.use('/api/user/auth', userAuthRoutes);
app.use('/api/user/news', userNewsRoutes);
app.use('/api/user/comments', userCommentRoutes);
app.use('/api/user/feedback', userFeedbackRoutes);
app.use('/api/user/ratings', userRatingRoutes);
app.use('/api/user/epaper', userEpaperRoutes);
app.use('/api/user/bookmarks', userBookmarkRoutes);
app.use('/api/user/categories', userCategoryRoutes);
app.use('/api/user/payment', userPaymentRoutes);
app.use('/api/user/plans', userPlanRoutes);
app.use('/api/user/franchise-leads', userFranchiseLeadRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


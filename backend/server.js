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
import adminServiceInformationRoutes from './routes/admin/serviceInformationRoutes.js';
import debugRoutes from './routes/debugRoutes.js';

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
import userNotificationRoutes from './routes/user/notificationRoutes.js';
import userServiceInformationRoutes from './routes/user/serviceInformationRoutes.js';

// Import middleware
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Check SMS Hub India connection
(async () => {
  try {
    const { default: smsHubIndiaService } = await import('./services/smsHubIndiaService.js');
    const testResult = await smsHubIndiaService.testConnection();
    if (testResult.success) {
      console.log(`✅ SMS Hub India Connected: ${testResult.senderId}`);
    } else {
      console.error('❌ SMS Hub India: Configuration missing. Please configure SMSINDIAHUB_API_KEY and SMSINDIAHUB_SENDER_ID environment variables.');
    }
  } catch (smsError) {
    console.error('❌ SMS Hub India: Configuration missing or invalid. Please check your environment variables.');
  }
})();

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'https://hamarasamachar.co.in',
      'https://www.hamarasamachar.co.in',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ];
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      // In production, only allow specific origins
      if (process.env.NODE_ENV === 'production') {
        callback(new Error('Not allowed by CORS'));
      } else {
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400, // 24 hours
};

// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Debug Routes (for testing notifications)
app.use('/api/debug', debugRoutes);

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
app.use('/api/admin/service-information', adminServiceInformationRoutes);

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
app.use('/api/user/notifications', userNotificationRoutes);
app.use('/api/user/service-information', userServiceInformationRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


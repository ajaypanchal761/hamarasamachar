import express from 'express';
import {
  sendBreakingNewsNotification,
  sendNewNewsNotification,
  sendNewEpaperNotification,
  sendCustomNotificationToUser,
  sendCategoryBasedNotification,
  sendSubscriptionExpiryReminder
} from '../services/pushNotificationService.js';
import User from '../models/User.js';

const router = express.Router();

// Test breaking news notification
router.post('/test-breaking-news', async (req, res) => {
  try {
    const testNewsData = {
      _id: '507f1f77bcf86cd799439011', // Sample ObjectId
      title: 'टेस्ट ब्रेकिंग न्यूज़ - यह एक परीक्षण अधिसूचना है',
      category: 'testing'
    };

    await sendBreakingNewsNotification(testNewsData);
    res.json({
      success: true,
      message: 'Breaking news notification test sent successfully',
      data: testNewsData
    });
  } catch (error) {
    console.error('Error in test breaking news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send breaking news notification',
      error: error.message
    });
  }
});

// Test new news notification
router.post('/test-new-news', async (req, res) => {
  try {
    const testNewsData = {
      _id: '507f1f77bcf86cd799439012',
      title: 'टेस्ट नई खबर - यह एक परीक्षण अधिसूचना है',
      category: 'testing',
      categorySlug: 'testing',
      district: 'test-district'
    };

    await sendNewNewsNotification(testNewsData);
    res.json({
      success: true,
      message: 'New news notification test sent successfully',
      data: testNewsData
    });
  } catch (error) {
    console.error('Error in test new news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send new news notification',
      error: error.message
    });
  }
});

// Test new e-paper notification
router.post('/test-new-epaper', async (req, res) => {
  try {
    const testEpaperData = {
      _id: '507f1f77bcf86cd799439013',
      date: new Date().toISOString().split('T')[0] // Today's date
    };

    await sendNewEpaperNotification(testEpaperData);
    res.json({
      success: true,
      message: 'New e-paper notification test sent successfully',
      data: testEpaperData
    });
  } catch (error) {
    console.error('Error in test new epaper:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send new e-paper notification',
      error: error.message
    });
  }
});

// Test custom notification to a specific user
router.post('/test-custom-notification/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { title = 'टेस्ट कस्टम अधिसूचना', body = 'यह एक परीक्षण अधिसूचना है', type = 'custom' } = req.body;

    await sendCustomNotificationToUser(userId, title, body, type);
    res.json({
      success: true,
      message: 'Custom notification sent successfully',
      data: { userId, title, body, type }
    });
  } catch (error) {
    console.error('Error in test custom notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send custom notification',
      error: error.message
    });
  }
});

// Test category-based notification
router.post('/test-category-notification', async (req, res) => {
  try {
    const testNewsData = {
      _id: '507f1f77bcf86cd799439014',
      title: 'टेस्ट कैटेगरी अधिसूचना - यह एक परीक्षण अधिसूचना है',
      category: 'testing',
      categorySlug: 'testing'
    };

    await sendCategoryBasedNotification(testNewsData);
    res.json({
      success: true,
      message: 'Category-based notification test sent successfully',
      data: testNewsData
    });
  } catch (error) {
    console.error('Error in test category notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send category-based notification',
      error: error.message
    });
  }
});

// Test subscription expiry reminder
router.post('/test-subscription-reminder/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { daysLeft = 7 } = req.body;

    await sendSubscriptionExpiryReminder(userId, daysLeft);
    res.json({
      success: true,
      message: 'Subscription expiry reminder sent successfully',
      data: { userId, daysLeft }
    });
  } catch (error) {
    console.error('Error in test subscription reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send subscription reminder',
      error: error.message
    });
  }
});

// Get all users for testing (with basic info)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone _id fcmToken').limit(10);
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        hasFcmToken: !!user.fcmToken
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Health check for debug routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Debug routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;

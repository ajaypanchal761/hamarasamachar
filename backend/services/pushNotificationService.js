import { sendNotificationToAllUsers, sendNotificationToUser } from './firebaseAdmin.js';
import Notification from '../models/Notification.js';

// Helper function to truncate content to approximately 20 words
const truncateContent = (content, maxWords = 20) => {
  if (!content) return '';

  const words = content.trim().split(/\s+/);
  if (words.length <= maxWords) return content.trim();

  return words.slice(0, maxWords).join(' ') + '...';
};

// Helper function to store notification in database
const storeNotification = async (userIds, notificationData) => {
  try {
    const notifications = userIds.map(userId => ({
      userId,
      title: notificationData.title,
      message: notificationData.body || notificationData.message,
      type: notificationData.type,
      data: {
        newsId: notificationData.data?.newsId,
        epaperId: notificationData.data?.epaperId,
        category: notificationData.data?.category,
        url: notificationData.url,
        priority: notificationData.data?.priority || 'normal',
        image: notificationData.data?.image || '',
        content: notificationData.data?.content || ''
      }
    }));

    await Notification.insertMany(notifications);
    console.log(`✅ Stored ${notifications.length} notifications in database`);
  } catch (error) {
    console.error('❌ Error storing notifications:', error);
  }
};

// Send breaking news notification
const sendBreakingNewsNotification = async (newsData) => {
  try {
    const payload = {
      title: '🚨 ब्रेकिंग न्यूज़',
      body: newsData.title || 'नई ब्रेकिंग न्यूज़ प्रकाशित हुई है',
      type: 'breaking_news',
      id: newsData._id?.toString() || '',
      url: `/news/${newsData._id}`,
      data: {
        newsId: newsData._id?.toString() || '',
        category: newsData.category || '',
        priority: 'high',
        image: newsData.featuredImage || '',
        content: truncateContent(newsData.content, 20),
      },
    };

    const result = await sendNotificationToAllUsers(payload);

    // Store notifications in database
    if (result && result.users && result.users.length > 0) {
      await storeNotification(result.users, payload);
    }
    } catch (error) {
    console.error('❌ [NOTIFICATION DEBUG] Error sending breaking news notification:', error);
    // Don't throw error to avoid breaking news creation
  }
};

// Send new news notification
const sendNewNewsNotification = async (newsData, targetUsers = null) => {
  try {
    const payload = {
      title: '📰 नई खबर',
      body: newsData.title || 'नई खबर प्रकाशित हुई है',
      type: 'new_news',
      id: newsData._id?.toString() || '',
      url: `/news/${newsData._id}`,
      data: {
        newsId: newsData._id?.toString() || '',
        category: newsData.category || '',
        district: newsData.district || '',
        priority: 'normal',
        image: newsData.featuredImage || '',
        content: truncateContent(newsData.content, 20),
      },
    };

    if (targetUsers) {
      // Send to specific users
      const result = await sendNotificationToUsers(targetUsers, payload);
      if (result && result.users && result.users.length > 0) {
        await storeNotification(result.users, payload);
      }
    } else {
      // Send to all users
      const result = await sendNotificationToAllUsers(payload);
      if (result && result.users && result.users.length > 0) {
        await storeNotification(result.users, payload);
      }
    }

    } catch (error) {
    console.error('❌ [NOTIFICATION DEBUG] Error sending new news notification:', error);
    // Don't throw error to avoid breaking news creation
  }
};

// Send new e-paper notification
const sendNewEpaperNotification = async (epaperData) => {
  try {
    const payload = {
      title: '🗞️ नया ई-पेपर',
      body: `हमारा समाचार - ${epaperData.date || 'आज का अंक'} उपलब्ध है`,
      type: 'new_epaper',
      id: epaperData._id?.toString() || '',
      url: '/epaper',
      data: {
        epaperId: epaperData._id?.toString() || '',
        date: epaperData.date || '',
        priority: 'normal',
      },
    };

    const result = await sendNotificationToAllUsers(payload);

    // Store notifications in database
    if (result && result.users && result.users.length > 0) {
      await storeNotification(result.users, payload);
    }
    } catch (error) {
    console.error('❌ [NOTIFICATION DEBUG] Error sending new e-paper notification:', error);
    // Don't throw error to avoid breaking e-paper creation
  }
};

// Send custom notification to specific user
const sendCustomNotificationToUser = async (userId, title, body, type = 'custom', data = {}) => {
  try {
    const payload = {
      title,
      body,
      type,
      data: {
        ...data,
        timestamp: Date.now(),
      },
    };

    const result = await sendNotificationToUser(userId, payload);

    // Store notification in database
    if (result && result.users && result.users.length > 0) {
      await storeNotification(result.users, payload);
    }
    } catch (error) {
    console.error('Error sending custom notification:', error);
    throw error;
  }
};

// Send notification based on news category preferences
const sendCategoryBasedNotification = async (newsData) => {
  try {
    const User = (await import('../models/User.js')).default;

    // Get users who have this category selected and notifications enabled
    const categorySlug = newsData.categorySlug || newsData.category;
    const users = await User.find({
      selectedCategories: categorySlug,
      status: 'Active',
      'notificationSettings.pushNotifications': { $ne: false },
      'notificationSettings.localNews': { $ne: false },
    });

    if (users.length === 0) {
      return;
    }

    const userIds = users.map(user => user._id);
    await sendNewNewsNotification(newsData, userIds);

    } catch (error) {
    console.error('❌ [NOTIFICATION DEBUG] Error sending category-based notification:', error);
  }
};

// Send notification for subscription expiry reminder
const sendSubscriptionExpiryReminder = async (userId, daysLeft) => {
  try {
    const payload = {
      title: '📅 सब्स्क्रिप्शन खत्म होने वाला है',
      body: `आपकी सब्स्क्रिप्शन ${daysLeft} दिन में खत्म हो रही है। नवीनीकरण करें।`,
      type: 'subscription_reminder',
      url: '/subscription',
      data: {
        daysLeft: daysLeft.toString(),
        priority: 'normal',
      },
    };

    const result = await sendNotificationToUser(userId, payload);

    // Store notification in database
    if (result && result.users && result.users.length > 0) {
      await storeNotification(result.users, payload);
    }
    } catch (error) {
    console.error('Error sending subscription expiry reminder:', error);
  }
};

export {
  sendBreakingNewsNotification,
  sendNewNewsNotification,
  sendNewEpaperNotification,
  sendCustomNotificationToUser,
  sendCategoryBasedNotification,
  sendSubscriptionExpiryReminder,
};

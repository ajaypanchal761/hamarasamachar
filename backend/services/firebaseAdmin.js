import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let firebaseAdminInitialized = false;
let admin = null;

// Dynamic import of firebase-admin to prevent server crash if package is not installed
const getFirebaseAdmin = async () => {
  if (admin) {
    return admin;
  }
  
  try {
    const firebaseAdminModule = await import('firebase-admin');
    admin = firebaseAdminModule.default;
    return admin;
  } catch (error) {
    console.error('❌ Firebase Admin package not found. Please run: npm install firebase-admin');
    console.error('❌ Error details:', error.message);
    return null;
  }
};

const initializeFirebaseAdmin = async () => {
  if (firebaseAdminInitialized) {
    return;
  }

  try {
    // Get firebase-admin module
    admin = await getFirebaseAdmin();
    
    // If package is not installed, return early
    if (!admin) {
      console.error('❌ Cannot initialize Firebase Admin: package not installed');
      firebaseAdminInitialized = false;
      return;
    }
    
    // Check if already initialized
    if (admin.apps.length > 0) {
      firebaseAdminInitialized = true;
      return;
    }

    // Try to initialize with service account file path from environment
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Try to initialize with environment variable containing JSON
      const serviceAccountJson = process.env.FIREBASE_CONFIG;
      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } else {
        // Fallback: try to find service account file in config directory
        const configDir = path.join(__dirname, '../config');
        const files = fs.readdirSync(configDir);
        const serviceAccountFile = files.find(file =>
          file.includes('firebase-adminsdk') && file.endsWith('.json')
        );

        if (serviceAccountFile) {
          const serviceAccountPath = path.join(configDir, serviceAccountFile);
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
        } else {
          throw new Error('Firebase service account not found. Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CONFIG environment variable.');
        }
      }
    }

    firebaseAdminInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    // Don't throw error - allow server to continue without Firebase
    // This prevents server crash if firebase-admin is not installed
    firebaseAdminInitialized = false;
  }
};

// Send push notification to multiple tokens
const sendPushNotification = async (tokens, payload) => {
  console.log('🔥 [FIREBASE DEBUG] sendPushNotification called with tokens count:', tokens?.length || 0, 'payload type:', payload?.type);

  if (!firebaseAdminInitialized) {
    console.log('🔧 [FIREBASE DEBUG] Initializing Firebase Admin...');
    await initializeFirebaseAdmin();
  }

  // If initialization failed, return early
  if (!firebaseAdminInitialized || !admin) {
    console.error('❌ [FIREBASE DEBUG] Firebase Admin is not initialized. Cannot send notifications.');
    return;
  }

  if (!tokens || tokens.length === 0) {
    console.log('⚠️ [FIREBASE DEBUG] No tokens provided for notification');
    return;
  }

  // Remove duplicates and empty tokens
  const uniqueTokens = [...new Set(tokens)].filter(token => token && token.trim());
  console.log('🔄 [FIREBASE DEBUG] Filtered tokens:', uniqueTokens.length, 'valid tokens');

  if (uniqueTokens.length === 0) {
    console.log('⚠️ [FIREBASE DEBUG] No valid tokens after filtering');
    return;
  }

  // Helper function to ensure all data values are strings (FCM requirement)
  const stringifyData = (data) => {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = typeof value === 'string' ? value : String(value);
    }
    return result;
  };

  // Prepare the message payload
  const message = {
    notification: {
      title: payload.title,
      body: payload.body,
      image: payload.data?.image || undefined, // Add image for rich notifications
    },
    data: stringifyData({
      type: payload.type || 'general',
      id: payload.id || '',
      url: payload.url || '',
      timestamp: Date.now(),
      ...payload.data,
    }),
    webpush: {
      notification: {
        icon: payload.data?.image || '/favicon.png',
        image: payload.data?.image || undefined,
        badge: '/favicon.png',
        requireInteraction: true,
      },
      fcm_options: {
        link: payload.url || '/',
      },
    },
  };

  try {
    // Ensure admin is loaded
    if (!admin) {
      admin = await getFirebaseAdmin();
    }
    
    // Check if messaging is available
    if (!admin.messaging) {
      throw new Error('Firebase Admin Messaging is not available. Please check Firebase Admin SDK initialization.');
    }

    // Use sendEach for multiple tokens (more reliable than sendMulticast)
    const messages = uniqueTokens.map(token => ({
      token: token,
      ...message,
    }));

    const results = await admin.messaging().sendEach(messages);

    console.log(`Push notification sent successfully:`);
    console.log(`- Total messages: ${results.responses.length}`);

    // Handle responses from sendEach
    let successCount = 0;
    let failureCount = 0;
    const failedTokens = [];

    results.responses.forEach((response, index) => {
      if (response.success) {
        successCount++;
      } else {
        failureCount++;
        console.error(`Token ${uniqueTokens[index]} failed:`, response.error);
        failedTokens.push(uniqueTokens[index]);
      }
    });

    console.log(`- Success count: ${successCount}`);
    console.log(`- Failure count: ${failureCount}`);

    // Handle failed tokens (could be expired or invalid)
    if (failureCount > 0) {
      // Remove invalid tokens from database
      const invalidTokens = [];
      results.responses.forEach((response, index) => {
        if (!response.success && response.error?.code === 'messaging/registration-token-not-registered') {
          invalidTokens.push(uniqueTokens[index]);
        }
      });

      if (invalidTokens.length > 0) {
        try {
          const User = (await import('../models/User.js')).default;

          // Remove each invalid token from database
          for (const invalidToken of invalidTokens) {
            await User.updateOne(
              { $or: [{ fcmTokens: invalidToken }, { fcmTokenMobile: invalidToken }] },
              { $pull: { fcmTokens: invalidToken, fcmTokenMobile: invalidToken } }
            );
          }

          console.log(`🧹 [FIREBASE DEBUG] Removed ${invalidTokens.length} invalid FCM tokens from database`);
        } catch (cleanupError) {
          console.error('❌ [FIREBASE DEBUG] Error cleaning up invalid tokens:', cleanupError);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

// Send notification to specific user
const sendNotificationToUser = async (userId, payload) => {
  try {
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Combine all tokens
    const tokens = [...user.fcmTokens, ...user.fcmTokenMobile];

    if (tokens.length === 0) {
      console.log(`No FCM tokens found for user ${userId}`);
      return { users: [], tokens: [] };
    }

    await sendPushNotification(tokens, payload);
    return { users: [userId], tokens };
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    throw error;
  }
};

// Send notification to multiple users
const sendNotificationToUsers = async (userIds, payload) => {
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ _id: { $in: userIds } });

    if (users.length === 0) {
      console.log('No users found');
      return { users: [], tokens: [] };
    }

    // Collect all tokens from all users
    const allTokens = [];
    const usersToNotify = [];
    users.forEach(user => {
      const userTokens = [...user.fcmTokens, ...user.fcmTokenMobile];
      allTokens.push(...userTokens);
      if (userTokens.length > 0) {
        usersToNotify.push(user._id);
      }
    });

    if (allTokens.length === 0) {
      console.log('No FCM tokens found for the users');
      return { users: [], tokens: [] };
    }

    await sendPushNotification(allTokens, payload);
    return { users: usersToNotify, tokens: allTokens };
  } catch (error) {
    console.error('Error sending notification to users:', error);
    throw error;
  }
};

// Send notification to all users (use with caution)
const sendNotificationToAllUsers = async (payload) => {
  console.log('👥 [FIREBASE DEBUG] sendNotificationToAllUsers called with payload type:', payload?.type);
  try {
    const User = (await import('../models/User.js')).default;
    const users = await User.find({ status: 'Active' });
    console.log('👤 [FIREBASE DEBUG] Found active users:', users.length);

    const allTokens = [];
    const usersToNotify = [];
    let usersWithNotifications = 0;

    users.forEach(user => {
      // Only send to users who have push notifications enabled
      if (user.notificationSettings?.pushNotifications !== false) {
        const userTokens = [...user.fcmTokens, ...user.fcmTokenMobile];
        allTokens.push(...userTokens);
        if (userTokens.length > 0) {
          usersWithNotifications++;
          usersToNotify.push(user._id);
        }
      }
    });

    console.log('🔑 [FIREBASE DEBUG] Users with push notifications enabled:', usersWithNotifications);
    console.log('🔑 [FIREBASE DEBUG] Total FCM tokens found:', allTokens.length);

    if (allTokens.length === 0) {
      console.log('⚠️ [FIREBASE DEBUG] No FCM tokens found for active users');
      return { users: [], tokens: [] };
    }

    await sendPushNotification(allTokens, payload);
    return { users: usersToNotify, tokens: allTokens };
  } catch (error) {
    console.error('❌ [FIREBASE DEBUG] Error sending notification to all users:', error);
    throw error;
  }
};

export {
  initializeFirebaseAdmin,
  sendPushNotification,
  sendNotificationToUser,
  sendNotificationToUsers,
  sendNotificationToAllUsers,
};

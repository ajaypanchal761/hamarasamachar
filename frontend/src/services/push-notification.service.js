import { messaging, getToken, onMessage } from '../firebase.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

const VAPID_KEY = 'BDxZszj5zDsoyv0oYRllDLyKwkMCVmvbwo91TTM1sH_OTz59dyydWnoRoB23RcXa43XgYEt6NTBHVx_cbtHCGlg';

export const isNotificationSupported = () => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

export const requestNotificationPermission = async () => {
  try {
    if (!isNotificationSupported()) {
      throw new Error('Notifications not supported');
    }
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const registerServiceWorker = async () => {
  try {
    console.log('🔧 [SERVICE WORKER] Registering service worker...');
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    await navigator.serviceWorker.ready;
    console.log('✅ [SERVICE WORKER] Service worker registered successfully');
    return registration;
  } catch (error) {
    console.error('❌ [SERVICE WORKER] Failed to register service worker:', error);
    throw error;
  }
};

export const getFCMToken = async () => {
  if (!messaging) {
    throw new Error('Firebase messaging not initialized');
  }

  const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  if (!registration) {
    throw new Error('Service worker not registered');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error('FCM token generation failed');
  }

  return token;
};

export const checkFCMStatus = async () => {
  try {
    if (!messaging) return false;
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    return !!token;
  } catch {
    return false;
  }
};

export const diagnoseNotifications = async () => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  return !!registration;
};

export const registerFCMToken = async (forceUpdate = false) => {
  let token = localStorage.getItem('fcm_token');

  if (!token || forceUpdate) {
    token = await getFCMToken();
    localStorage.setItem('fcm_token', token);
  }

  const authToken = localStorage.getItem('userToken');
  if (!authToken) return;

  const response = await fetch(`${API_BASE_URL}/user/auth/save-fcm-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`
    },
    body: JSON.stringify({ token, platform: 'web' })
  });

  if (!response.ok) {
    throw new Error('Failed to save FCM token');
  }

  return token;
};

export const setupForegroundNotificationHandler = (callback) => {
  if (!messaging) {
    console.log('🔴 [NOTIFICATION] Firebase messaging not initialized');
    return;
  }

  console.log('🟢 [NOTIFICATION] Setting up foreground notification handler');

  onMessage(messaging, (payload) => {
    console.log('📱 [NOTIFICATION] Foreground notification received:', payload);
    console.log('📱 [NOTIFICATION] Notification permission:', Notification.permission);
    console.log('📱 [NOTIFICATION] Document visibility:', document.visibilityState);

    // Show browser notification when app is in foreground
    if (Notification.permission === 'granted') {
      console.log('🔔 [NOTIFICATION] Creating browser notification');
      console.log('🔔 [NOTIFICATION] Browser:', navigator.userAgent);
      console.log('🔔 [NOTIFICATION] Notification support:', 'Notification' in window);
      console.log('🔔 [NOTIFICATION] Image support:', 'image' in Notification.prototype);

      // Enhanced image handling for better browser support
      const imageUrl = payload.data?.image;
      console.log('🖼️ [NOTIFICATION] Image URL from payload:', imageUrl);

      const notificationOptions = {
        body: payload.notification?.body || 'नई अधिसूचना',
        icon: imageUrl || '/favicon.png', // Use news image as icon if available
        badge: '/favicon.png',
        data: payload.data || {},
        tag: payload.data?.id || 'general', // Prevents duplicate notifications
        requireInteraction: true, // Keep notification visible until user interacts
        silent: false
      };

      // Add image property only for supported browsers (Chrome, Edge)
      if (imageUrl && ('image' in Notification.prototype)) {
        notificationOptions.image = imageUrl;
        console.log('✅ [NOTIFICATION] Rich notification image added:', imageUrl);
      } else if (imageUrl) {
        console.log('⚠️ [NOTIFICATION] Browser does not support rich notification images, using icon only');
        console.log('ℹ️ [NOTIFICATION] Supported browsers: Chrome 56+, Edge 79+, Opera 43+');
      } else {
        console.log('ℹ️ [NOTIFICATION] No image URL provided, using default icon');
      }

      try {
        const notification = new Notification(
          payload.notification?.title || 'हमारा समाचार',
          notificationOptions
        );
        console.log('✅ [NOTIFICATION] Notification created successfully');
      } catch (error) {
        console.error('❌ [NOTIFICATION] Error creating notification:', error);
      }

      notification.onclick = () => {
        console.log('🖱️ [NOTIFICATION] Notification clicked');
        console.log('🖱️ [NOTIFICATION] Notification data:', payload.data);
        console.log('🖱️ [NOTIFICATION] Image used:', payload.data?.image || '/favicon.png');

        notification.close();

        // Handle navigation based on notification type
        const notificationData = payload.data || {};
        let url = '/'; // Default fallback

        // Determine URL based on notification type and data
        switch (notificationData.type) {
          case 'breaking_news':
          case 'new_news':
            url = notificationData.url || `/news/${notificationData.newsId || notificationData.id}`;
            console.log('🖱️ [NOTIFICATION] Navigating to news:', url);
            break;
          case 'new_epaper':
            url = notificationData.url || '/epaper';
            console.log('🖱️ [NOTIFICATION] Navigating to epaper:', url);
            break;
          case 'message':
            url = notificationData.url || `/chat/${notificationData.conversationId || notificationData.userId}`;
            console.log('🖱️ [NOTIFICATION] Navigating to chat:', url);
            break;
          default:
            url = notificationData.url || notificationData.link || '/';
            console.log('🖱️ [NOTIFICATION] Navigating to default:', url);
        }

        try {
          window.open(url, '_blank');
        } catch (error) {
          console.error('❌ [NOTIFICATION] Error opening URL:', error);
          // Fallback navigation
          window.location.href = url;
        }
      };

      // Auto-close notification after 10 seconds if not interacted with
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 10000);

    } else {
      console.log('🚫 [NOTIFICATION] Notification permission not granted');
    }

    if (callback) callback(payload);
  });
};

let pushNotificationsInitialized = false;

export const initializePushNotificationsAfterLogin = async () => {
  if (pushNotificationsInitialized) {
    console.log('ℹ️ [INIT] Push notifications already initialized');
    return true;
  }

  console.log('🚀 [INIT] Starting push notification initialization...');

  if (!isNotificationSupported()) {
    console.log('🚫 [INIT] Notifications not supported in this browser');
    return false;
  }

  try {
    await registerServiceWorker();

    const granted = await requestNotificationPermission();
    if (!granted) {
      console.log('🚫 [INIT] Notification permission not granted');
      return false;
    }

    const token = await registerFCMToken();
    if (!token) {
      console.log('🚫 [INIT] Failed to get FCM token');
      return false;
    }

    pushNotificationsInitialized = true;
    console.log('✅ [INIT] Push notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ [INIT] Failed to initialize push notifications:', error);
    return false;
  }
};

export const initializePushNotifications = async () => {
  return initializePushNotificationsAfterLogin();
};

export const cleanupPushNotifications = () => {
  localStorage.removeItem('fcm_token');

  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
};

export const generateNewVAPIDKey = async () => {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKey = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(publicKey)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const testNotificationPopup = () => {
  if (Notification.permission === 'granted') {
    console.log('🔔 [TEST] Creating test notification');
    const testNotification = new Notification('Test Notification', {
      body: 'This is a test notification to verify popup functionality',
      icon: '/favicon.png',
      badge: '/favicon.png',
      requireInteraction: true,
      silent: false
    });

    testNotification.onclick = () => {
      console.log('🖱️ [TEST] Test notification clicked');
      testNotification.close();
      alert('Test notification clicked successfully!');
    };

    setTimeout(() => {
      if (testNotification) {
        testNotification.close();
      }
    }, 10000);

    return true;
  } else {
    console.log('🚫 [TEST] Notification permission not granted');
    return false;
  }
};

if (typeof window !== 'undefined') {
  window.testNotifications = {
    diagnose: diagnoseNotifications,
    checkFCM: checkFCMStatus,
    generateVAPID: generateNewVAPIDKey,
    checkPermission: () => Notification.permission,
    checkServiceWorker: async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    },
    testPopup: testNotificationPopup,
    showTestNotification: testNotificationPopup
  };
}

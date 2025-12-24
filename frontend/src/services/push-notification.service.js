import { messaging, getToken, onMessage } from '../firebase.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006/api';

const VAPID_KEY = 'BFrFmFuypdSWCUb3rF4xnA1SjMM-QPc3_KCRrfik7niIY18PgoBrkwDdTCmR05AXtsKJS1a4Wasy7DIyNhkXJOM';

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
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;
  return registration;
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
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    // if (Notification.permission === 'granted') {
    //   const notification = new Notification(
    //     payload.notification?.title || 'हमारा समाचार',
    //     {
    //       body: payload.notification?.body || 'नई अधिसूचना',
    //       icon: '/favicon.png'
    //     }
    //   );

    //   notification.onclick = () => {
    //     notification.close();
    //     window.open(payload.data?.url || '/', '_blank');
    //   };
    // }

    if (callback) callback(payload);
  });
};

let pushNotificationsInitialized = false;

export const initializePushNotificationsAfterLogin = async () => {
  if (pushNotificationsInitialized) return true;
  if (!isNotificationSupported()) return false;

  await registerServiceWorker();

  const granted = await requestNotificationPermission();
  if (!granted) return false;

  const token = await registerFCMToken();
  if (!token) return false;

  pushNotificationsInitialized = true;
  return true;
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

if (typeof window !== 'undefined') {
  window.testNotifications = {
    diagnose: diagnoseNotifications,
    checkFCM: checkFCMStatus,
    generateVAPID: generateNewVAPIDKey,
    checkPermission: () => Notification.permission,
    checkServiceWorker: async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!reg;
    }
  };
}

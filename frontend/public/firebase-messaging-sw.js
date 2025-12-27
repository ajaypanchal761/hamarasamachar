// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5mOi_Czw0N_8AciLQtBE0WIxsVpRENEE",
  authDomain: "hamara-samachar-4b848.firebaseapp.com",
  projectId: "hamara-samachar-4b848",
  storageBucket: "hamara-samachar-4b848.firebasestorage.app",
  messagingSenderId: "307870142478",
  appId: "1:307870142478:web:89b8924dde94e9dbe2ac5f",
  measurementId: "G-27LYLBK5P5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'हमारा समाचार';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'नई अधिसूचना',
    icon: payload.data?.image || '/favicon.png',
    badge: '/favicon.png',
    image: payload.data?.image || undefined, // Add rich notification image
    data: payload.data || {},
    tag: payload.data?.id || 'general', // Prevents duplicate notifications
    requireInteraction: false, // Auto-close notification
    silent: false,
    actions: [
      {
        action: 'view',
        title: 'देखें'
      },
      {
        action: 'close',
        title: 'बंद करें'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  let url = '/'; // Default fallback

  // Determine URL based on notification type and data
  switch (notificationData.type) {
    case 'breaking_news':
    case 'new_news':
      url = notificationData.url || `/news/${notificationData.newsId || notificationData.id}`;
      break;
    case 'new_epaper':
      url = notificationData.url || '/epaper';
      break;
    case 'message':
      url = notificationData.url || `/chat/${notificationData.conversationId || notificationData.userId}`;
      break;
    default:
      url = notificationData.url || notificationData.link || '/';
  }

  // Handle action clicks
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(url)
    );
  } else if (event.action === 'close') {
    // Just close the notification (already done above)
  } else {
    // Default action when notification is clicked (not an action button)
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }

        // If not, open a new window/tab with the target URL
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim().then(() => {
      })
  );
});

# Push Notification System - API Endpoints & SOPs

## 📋 Document Information
- **Version**: 2.1
- **Last Updated**: December 24, 2025
- **System**: Hamara Samachar News Application
- **Technology**: Firebase Cloud Messaging (FCM)
- **Platforms**: Web Browser & Mobile Apps (iOS/Android)

---

## 🎯 Overview

This document provides complete API endpoints and Standard Operating Procedures (SOP) for push notifications on both web and mobile platforms. The system supports real-time notifications for breaking news, new articles, e-paper uploads, and custom notifications.

### Key Features
- ✅ Firebase Cloud Messaging integration
- ✅ Web browser notifications
- ✅ Mobile app notifications (iOS/Android)
- ✅ Toast notifications in-app
- ✅ FCM token management
- ✅ Automatic notification triggers
- ✅ Category-based notifications

---

## 📡 API Endpoints Reference

### 🔐 Authentication Required
All endpoints marked with 🔐 require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🌐 Web Notification API Endpoints

### 1. FCM Token Management

#### Save Web FCM Token
```http
POST /api/user/auth/save-fcm-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm-token-string-here",
  "platform": "web"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token saved successfully"
}
```

#### Remove Web FCM Token
```http
DELETE /api/user/auth/remove-fcm-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm-token-string-here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token removed successfully"
}
```

---

## 📱 Mobile App Notification API Endpoints

### 1. FCM Token Management

#### Save Mobile FCM Token
```http
POST /api/user/auth/save-fcm-token-mobile
Content-Type: application/json

{
  "token": "fcm-mobile-token-string-here",
  "userId": "user-object-id" // Optional if using JWT auth
}
```

**Headers (if not using JWT):**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token saved successfully"
}
```

---

## 🧪 Testing & Debug API Endpoints

### Base URL: `/api/debug`

### 1. Test Notification Types

#### Test Breaking News Notification
```http
POST /api/debug/test-breaking-news
Content-Type: application/json

{
  "title": "🚨 टेस्ट ब्रेकिंग न्यूज़",
  "body": "यह एक परीक्षण अधिसूचना है"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Breaking news notification test sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "🚨 टेस्ट ब्रेकिंग न्यूज़ - यह एक परीक्षण अधिसूचना है",
    "category": "testing"
  }
}
```

#### Test New News Notification
```http
POST /api/debug/test-new-news
Content-Type: application/json

{
  "title": "📰 टेस्ट नई खबर",
  "body": "यह एक परीक्षण अधिसूचना है"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New news notification test sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "📰 टेस्ट नई खबर - यह एक परीक्षण अधिसूचना है",
    "category": "testing",
    "categorySlug": "testing",
    "district": "test-district"
  }
}
```

#### Test New E-Paper Notification
```http
POST /api/debug/test-new-epaper
Content-Type: application/json

{
  "date": "2025-12-24"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New e-paper notification test sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "date": "2025-12-24"
  }
}
```

#### Test Custom Notification to User
```http
POST /api/debug/test-custom-notification/:userId
Content-Type: application/json

{
  "title": "👤 कस्टम अधिसूचना",
  "body": "यह एक व्यक्तिगत परीक्षण अधिसूचना है",
  "type": "custom"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom notification sent successfully",
  "data": {
    "userId": "user-object-id",
    "title": "👤 कस्टम अधिसूचना",
    "body": "यह एक व्यक्तिगत परीक्षण अधिसूचना है",
    "type": "custom"
  }
}
```

#### Test Category-Based Notification
```http
POST /api/debug/test-category-notification
Content-Type: application/json

{
  "title": "📂 कैटेगरी अधिसूचना",
  "body": "यह एक कैटेगरी-आधारित परीक्षण अधिसूचना है"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category-based notification test sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "📂 कैटेगरी अधिसूचना - यह एक कैटेगरी-आधारित परीक्षण अधिसूचना है",
    "category": "testing",
    "categorySlug": "testing"
  }
}
```

#### Test Subscription Expiry Reminder
```http
POST /api/debug/test-subscription-reminder/:userId
Content-Type: application/json

{
  "daysLeft": 7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription expiry reminder sent successfully",
  "data": {
    "userId": "user-object-id",
    "daysLeft": 7
  }
}
```

### 2. Utility Endpoints

#### Get Users for Testing
```http
GET /api/debug/users
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-object-id",
      "name": "User Name",
      "email": "user@example.com",
      "phone": "+919876543210",
      "hasFcmToken": true
    }
  ]
}
```

#### Debug Health Check
```http
GET /api/debug/health
```

**Response:**
```json
{
  "success": true,
  "message": "Debug routes are working",
  "timestamp": "2025-12-24T12:00:00.000Z"
}
```

---

## 📋 Notification Types & Payload Structure

### 1. Breaking News Notification
```javascript
{
  title: '🚨 ब्रेकिंग न्यूज़',
  body: 'News title here...',
  type: 'breaking_news',
  id: 'news-object-id',
  url: '/news/news-id',
  data: {
    newsId: 'news-object-id',
    category: 'category-slug',
    priority: 'high'
  }
}
```

### 2. New News Notification
```javascript
{
  title: '📰 नई खबर',
  body: 'News title here...',
  type: 'new_news',
  id: 'news-object-id',
  url: '/news/news-id',
  data: {
    newsId: 'news-object-id',
    category: 'category-slug',
    district: 'district-name',
    priority: 'normal'
  }
}
```

### 3. New E-Paper Notification
```javascript
{
  title: '🗞️ नया ई-पेपर',
  body: 'हमारा समाचार - आज का अंक उपलब्ध है',
  type: 'new_epaper',
  id: 'epaper-object-id',
  url: '/epaper',
  data: {
    epaperId: 'epaper-object-id',
    date: '2025-12-24',
    priority: 'normal'
  }
}
```

### 4. Custom Notification
```javascript
{
  title: 'Custom title',
  body: 'Custom message',
  type: 'custom',
  data: {
    ...customData,
    timestamp: Date.now()
  }
}
```

### 5. Category-Based Notification
```javascript
{
  title: '📰 नई खबर',
  body: 'News title for category subscribers...',
  type: 'category_news',
  id: 'news-object-id',
  url: '/news/news-id',
  data: {
    newsId: 'news-object-id',
    category: 'category-slug',
    district: 'district-name',
    priority: 'normal'
  }
}
```

### 6. Subscription Expiry Reminder
```javascript
{
  title: '📅 सब्स्क्रिप्शन खत्म होने वाला है',
  body: 'आपकी सब्स्क्रिप्शन X दिन में खत्म हो रही है। नवीनीकरण करें।',
  type: 'subscription_reminder',
  url: '/subscription',
  data: {
    daysLeft: 7,
    priority: 'normal'
  }
}
```

---

## 🔧 Implementation Guide

### For Web Applications

#### 1. Firebase Configuration
```javascript
// frontend/src/firebase.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "hamara-samachar-4b848.firebaseapp.com",
  projectId: "hamara-samachar-4b848",
  storageBucket: "hamara-samachar-4b848.firebasestorage.app",
  messagingSenderId: "307870142478",
  appId: "1:307870142478:web:89b8924dde94e9dbe2ac5f",
  measurementId: "G-27LYLBK5P5"
};
```

#### 2. Service Worker Setup
Ensure `firebase-messaging-sw.js` is in the public folder and handles:
- Background message reception
- Notification display
- Click actions

#### 3. Token Registration
```javascript
// After user login
await initializePushNotificationsAfterLogin();
```

### For Mobile Applications

#### 1. Firebase SDK Integration
- Add Firebase SDK to mobile project
- Configure Firebase with project credentials
- Initialize FCM in app delegate/application class

#### 2. Token Registration
```javascript
// iOS (Swift)
Messaging.messaging().token { token, error in
  if let token = token {
    // Send to /api/user/auth/save-fcm-token-mobile
  }
}

// Android (Kotlin)
FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
  if (!task.isSuccessful) return@addOnCompleteListener
  val token = task.result
  // Send to /api/user/auth/save-fcm-token-mobile
}
```

#### 3. Background Message Handling
Configure notification channels and handle background messages according to platform guidelines.

---

## 🧪 Testing Procedures

### 1. Web Browser Testing

#### Manual Testing Steps:
1. Open browser developer tools
2. Navigate to application
3. Check notification permission: `Notification.permission`
4. Check FCM token: `window.testNotifications.checkFCM()`
5. Check service worker: `window.testNotifications.checkServiceWorker()`

#### API Testing Commands:
```bash
# Test breaking news
curl -X POST http://localhost:5006/api/debug/test-breaking-news

# Test with specific user
curl -X POST http://localhost:5006/api/debug/test-custom-notification/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"Web Test"}'
```

### 2. Mobile App Testing

#### Android Testing:
1. Install app on device/emulator
2. Grant notification permissions
3. Check FCM token generation
4. Test background notification delivery
5. Verify notification click actions

#### iOS Testing:
1. Install app on device/simulator
2. Request notification permissions
3. Verify FCM token registration
4. Test foreground/background notifications
5. Check notification categories and actions

### 3. End-to-End Testing

#### Complete Notification Flow:
1. User registers/logs in (web or app)
2. FCM token generated and saved to backend
3. Admin publishes content (news/e-paper)
4. Notification sent to all/specific users
5. User receives notification on device
6. User clicks notification and navigates to content

---

## 🔧 Troubleshooting Guide

### Issue: Web Notifications Not Working

#### 1. Check Browser Support
```javascript
// Check if notifications are supported
if ('Notification' in window && 'serviceWorker' in navigator) {
  console.log('Notifications supported');
}
```

#### 2. Verify Service Worker
```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});
```

#### 3. Check FCM Token
```javascript
// Verify FCM token exists
import { getMessaging, getToken } from 'firebase/messaging';
const messaging = getMessaging();
getToken(messaging).then(token => console.log('FCM Token:', token));
```

### Issue: Mobile App Notifications Not Working

#### 1. Check FCM Configuration
- Verify google-services.json (Android) or GoogleService-Info.plist (iOS)
- Ensure FCM is properly initialized
- Check Firebase project configuration

#### 2. Verify Token Registration
- Check if token is being sent to backend API
- Verify JWT authentication for mobile token saving
- Check database for stored tokens

#### 3. Check Platform Permissions
- Ensure notification permissions are granted
- Verify background refresh is enabled (iOS)
- Check notification settings in device settings

### Issue: Notifications Sent But Not Received

#### 1. Check FCM Console
- Monitor Firebase Console for delivery statistics
- Check for invalid/expired tokens
- Review error messages

#### 2. Verify Token Validity
```javascript
// Check if token is still valid
// Test with FCM diagnostic tools
```

#### 3. Check Server Logs
- Review backend logs for FCM API errors
- Check MongoDB connection
- Verify notification payload structure

---

## 📊 Monitoring & Analytics

### Key Metrics to Monitor

#### 1. Delivery Metrics
- Total notifications sent
- Successful delivery rate
- Failed delivery rate
- Platform-specific success rates

#### 2. User Engagement
- Notification open rates
- Click-through rates
- User opt-out rates

#### 3. Performance Metrics
- FCM API response times
- Token registration success rate
- Database query performance

### Firebase Console Monitoring
1. Access Firebase Console → Cloud Messaging
2. Review delivery statistics
3. Monitor error rates
4. Check token health

### Database Monitoring
```javascript
// Check token storage
db.users.countDocuments({fcmTokens: {$exists: true}})
db.users.countDocuments({fcmTokenMobile: {$exists: true}})

// Monitor notification preferences
db.users.countDocuments({"notificationSettings.pushNotifications": true})
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Firebase project configured for both platforms
- [ ] Service account keys in place
- [ ] Environment variables set
- [ ] Database connections tested
- [ ] API endpoints tested
- [ ] Service workers configured

### Post-Deployment
- [ ] Web notification testing completed
- [ ] Mobile app notification testing completed
- [ ] User acceptance testing passed
- [ ] Monitoring dashboards set up
- [ ] Documentation updated

### Platform-Specific Checks
#### Web
- [ ] HTTPS certificate valid
- [ ] Service worker cached
- [ ] VAPID keys configured
- [ ] Browser compatibility tested

#### Mobile
- [ ] App store builds include FCM
- [ ] Push notification entitlements (iOS)
- [ ] Notification channels configured (Android)
- [ ] Background modes enabled

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

#### Daily
- Monitor notification delivery rates
- Check server error logs
- Review Firebase Console alerts

#### Weekly
- Clean expired FCM tokens
- Update notification preferences
- Review user feedback

#### Monthly
- Analyze notification performance
- Update Firebase SDK versions
- Review platform compatibility

### Emergency Contacts
- **Development Team**: For code-related issues
- **DevOps Team**: For infrastructure issues
- **Firebase Support**: For FCM-specific issues

---

## 📋 Quick Reference

### Web Endpoints Summary
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/user/auth/save-fcm-token` | Save web FCM token |
| DELETE | `/api/user/auth/remove-fcm-token` | Remove web FCM token |

### Mobile Endpoints Summary
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/user/auth/save-fcm-token-mobile` | Save mobile FCM token |

### Debug Endpoints Summary
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/debug/test-breaking-news` | Test breaking news |
| POST | `/api/debug/test-new-news` | Test new news |
| POST | `/api/debug/test-new-epaper` | Test e-paper |
| POST | `/api/debug/test-custom-notification/:id` | Test custom notification |
| POST | `/api/debug/test-category-notification` | Test category notification |
| POST | `/api/debug/test-subscription-reminder/:id` | Test subscription reminder |
| GET | `/api/debug/users` | Get test users |
| GET | `/api/debug/health` | Health check |

---

*This comprehensive SOP ensures proper implementation and maintenance of push notifications across web and mobile platforms for the Hamara Samachar application.*

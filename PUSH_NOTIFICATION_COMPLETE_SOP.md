# Push Notification System - Complete SOP

## 📋 Document Information
- **Version**: 2.2
- **Last Updated**: December 25, 2025
- **System**: Hamara Samachar News Application
- **Technology**: Firebase Cloud Messaging (FCM)
- **Platforms**: Web Browser & Mobile Apps (iOS/Android)

---

## 🎯 Overview

This comprehensive Standard Operating Procedure (SOP) documents the complete push notification system implementation for the Hamara Samachar news application. The system supports real-time notifications for breaking news, new articles, e-paper uploads, and custom notifications across both web and mobile platforms.

### Key Features Implemented
- ✅ Firebase Cloud Messaging integration for web and mobile
- ✅ Toast notifications in-app for web
- ✅ Browser popup notifications for web
- ✅ Mobile FCM token storage and management
- ✅ Automatic notification triggers for news/e-paper
- ✅ User notification preferences management
- ✅ Comprehensive testing and debugging endpoints
- ✅ Real-time notification delivery and management

---

## 📡 Complete API Endpoints Reference

### 🔐 Authentication Requirements
All user endpoints require JWT authentication:
```
Authorization: Bearer <jwt_token>
```

---

## 🌐 Web Push Notification API Endpoints

### 1. FCM Token Management
**Endpoint:** `POST /api/user/auth/save-fcm-token`
**Purpose:** Register/save web FCM token for push notifications
**Authentication:** Required (JWT)

**Request:**
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

**Error Response:**
```json
{
  "success": false,
  "message": "Token required"
}
```

**Files Involved:**
- `backend/controllers/user/authController.js` (line ~121-142)
- `backend/routes/user/authRoutes.js` (line 23)
- `frontend/src/services/push-notification.service.js` (line ~90-104)

### 2. FCM Token Removal
**Endpoint:** `DELETE /api/user/auth/remove-fcm-token`
**Purpose:** Remove FCM token (logout/unsubscribe)
**Authentication:** Required (JWT)

**Request:**
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

**Files Involved:**
- `backend/controllers/user/authController.js` (line ~178-194)
- `backend/routes/user/authRoutes.js` (line 25)
- `frontend/src/services/push-notification.service.js` (line ~152-157)

---

## 📱 Mobile App Push Notification API Endpoints

### 1. Mobile FCM Token Registration
**Endpoint:** `POST /api/user/auth/save-fcm-token-mobile`
**Purpose:** Register/save mobile FCM token for push notifications
**Authentication:** Optional (JWT) - supports both authenticated and anonymous

**Request:**
```http
POST /api/user/auth/save-fcm-token-mobile
Content-Type: application/json

{
  "token": "mobile-fcm-token-string-here",
  "userId": "user-mongodb-object-id" // Optional if using JWT
}
```

**Headers (if using JWT):**
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

**Error Responses:**
```json
{
  "success": false,
  "message": "Token required"
}
// OR
{
  "success": false,
  "message": "User not found"
}
```

**Files Involved:**
- `backend/controllers/user/authController.js` (line ~143-172)
- `backend/routes/user/authRoutes.js` (line 24)
- `backend/models/User.js` (line ~132)

---

## 📊 Notification Management API Endpoints

### 1. Get User Notifications
**Endpoint:** `GET /api/user/notifications`
**Purpose:** Fetch paginated user notifications
**Authentication:** Required (JWT)

**Request:**
```http
GET /api/user/notifications?page=1&limit=20&type=breaking_news&isRead=false
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `type` (string): Filter by notification type
- `isRead` (boolean): Filter by read status

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "mongodb-object-id",
      "title": "ब्रेकिंग न्यूज़",
      "message": "महत्वपूर्ण समाचार...",
      "type": "breaking_news",
      "isRead": false,
      "sentAt": "2025-12-25T10:30:00.000Z",
      "data": {
        "newsId": "news-object-id",
        "url": "/news/news-id"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalNotifications": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Files Involved:**
- `backend/controllers/user/notificationController.js` (line ~8-45)
- `backend/routes/user/notificationRoutes.js` (line 7)
- `frontend/src/modules/user/services/notificationService.js` (line ~5-25)
- `frontend/src/modules/user/pages/NotificationPage.jsx` (line ~32-59)

### 2. Mark Notification as Read
**Endpoint:** `PUT /api/user/notifications/:id/read`
**Purpose:** Mark specific notification as read
**Authentication:** Required (JWT)

**Request:**
```http
PUT /api/user/notifications/64f1b2c3d4e5f6789abcdef01/read
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "notification": {
    "_id": "64f1b2c3d4e5f6789abcdef01",
    "isRead": true,
    "readAt": "2025-12-25T10:35:00.000Z"
  }
}
```

**Files Involved:**
- `backend/controllers/user/notificationController.js` (line ~48-75)
- `backend/routes/user/notificationRoutes.js` (line 10)
- `frontend/src/modules/user/services/notificationService.js` (line ~27-40)
- `frontend/src/modules/user/pages/NotificationPage.jsx` (line ~102-125)

### 3. Mark All Notifications as Read
**Endpoint:** `PUT /api/user/notifications/mark-all-read`
**Purpose:** Mark all notifications as read (optionally by type)
**Authentication:** Required (JWT)

**Request:**
```http
PUT /api/user/notifications/mark-all-read
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "breaking_news" // Optional: mark only specific type
}
```

**Response:**
```json
{
  "success": true,
  "message": "45 notifications marked as read"
}
```

**Files Involved:**
- `backend/controllers/user/notificationController.js` (line ~78-105)
- `backend/routes/user/notificationRoutes.js` (line 9)
- `frontend/src/modules/user/services/notificationService.js` (line ~42-58)
- `frontend/src/modules/user/pages/NotificationPage.jsx` (line ~148-157)

### 4. Delete Notification
**Endpoint:** `DELETE /api/user/notifications/:id`
**Purpose:** Delete specific notification
**Authentication:** Required (JWT)

**Request:**
```http
DELETE /api/user/notifications/64f1b2c3d4e5f6789abcdef01
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Files Involved:**
- `backend/controllers/user/notificationController.js` (line ~108-135)
- `backend/routes/user/notificationRoutes.js` (line 11)
- `frontend/src/modules/user/services/notificationService.js` (line ~60-73)
- `frontend/src/modules/user/pages/NotificationPage.jsx` (line ~131-146)

### 5. Get Notification Statistics
**Endpoint:** `GET /api/user/notifications/stats`
**Purpose:** Get notification counts and statistics
**Authentication:** Required (JWT)

**Request:**
```http
GET /api/user/notifications/stats
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "unread": 12,
    "byType": {
      "breaking_news": { "total": 20, "unread": 3 },
      "new_news": { "total": 80, "unread": 8 },
      "new_epaper": { "total": 30, "unread": 1 },
      "custom": { "total": 10, "unread": 0 },
      "subscription_reminder": { "total": 10, "unread": 0 }
    }
  }
}
```

**Files Involved:**
- `backend/controllers/user/notificationController.js` (line ~138-185)
- `backend/routes/user/notificationRoutes.js` (line 8)
- `frontend/src/modules/user/services/notificationService.js` (line ~75-88)
- `frontend/src/modules/user/pages/NotificationPage.jsx` (line ~61-70)

### 6. Update User Profile (Notification Settings)
**Endpoint:** `PUT /api/user/auth/profile`
**Purpose:** Update user notification preferences
**Authentication:** Required (JWT)

**Request:**
```http
PUT /api/user/auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "notificationSettings": {
    "pushNotifications": true,
    "breakingNews": true,
    "localNews": false,
    "sportsNews": true,
    "entertainmentNews": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "notificationSettings": {
      "pushNotifications": true,
      "breakingNews": true,
      "localNews": false,
      "sportsNews": true,
      "entertainmentNews": false
    }
  }
}
```

**Files Involved:**
- `backend/controllers/user/authController.js` (line ~60-85)
- `backend/routes/user/authRoutes.js` (line 18)
- `frontend/src/services/authService.js` (line ~150-194)
- `frontend/src/modules/user/pages/ProfilePage.jsx` (line ~385-402)

---

## 🧪 Testing & Debug API Endpoints

### Base URL: `/api/debug` (No authentication required)

### 1. Breaking News Test
**Endpoint:** `POST /api/debug/test-breaking-news`

**Response:** Sends breaking news notification to all active users

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 15-37)
- `backend/services/pushNotificationService.js` (line 29-50)

### 2. New News Test
**Endpoint:** `POST /api/debug/test-new-news`

**Response:** Sends new news notification to all users

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 40-64)
- `backend/services/pushNotificationService.js` (line 53-76)

### 3. E-Paper Test
**Endpoint:** `POST /api/debug/test-new-epaper`

**Request:**
```json
{
  "date": "2025-12-25"
}
```

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 67-88)
- `backend/services/pushNotificationService.js` (line 79-100)

### 4. Custom Notification Test
**Endpoint:** `POST /api/debug/test-custom-notification/:userId`

**Request:**
```json
{
  "title": "Test Notification",
  "body": "This is a test notification",
  "type": "custom"
}
```

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 91-110)
- `backend/services/pushNotificationService.js` (line 103-115)

### 5. Category-Based Notification Test
**Endpoint:** `POST /api/debug/test-category-notification`

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 113-135)
- `backend/services/pushNotificationService.js` (line 118-124)

### 6. Subscription Reminder Test
**Endpoint:** `POST /api/debug/test-subscription-reminder/:userId`

**Request:**
```json
{
  "daysLeft": 7
}
```

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 138-157)
- `backend/services/pushNotificationService.js` (line 127-144)

### 7. Get Test Users
**Endpoint:** `GET /api/debug/users`

**Response:** Returns test user list for debugging

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 160-182)

### 8. Debug Health Check
**Endpoint:** `GET /api/debug/health`

**Files Involved:**
- `backend/routes/debugRoutes.js` (line 185-191)

---

## 📁 Complete File Reference

### Backend Files

#### 🔧 Core Infrastructure
1. **`backend/services/firebaseAdmin.js`** (261 lines)
   - Firebase Admin SDK initialization
   - FCM message sending functions
   - Token validation and management
   - User notification broadcasting

2. **`backend/services/pushNotificationService.js`** (154 lines)
   - High-level notification functions
   - Breaking news, new news, e-paper notifications
   - Custom notifications to users
   - Category-based notifications
   - Subscription expiry reminders

3. **`backend/models/Notification.js`** (37 lines)
   - Notification data schema
   - User-specific notifications
   - Read/unread status tracking
   - Automatic expiration (30 days)

4. **`backend/models/User.js`** (158 lines)
   - FCM token storage (`fcmTokens`, `fcmTokenMobile`)
   - Notification settings (`notificationSettings`)
   - User profile management

#### 🎛️ API Controllers
5. **`backend/controllers/user/notificationController.js`** (187 lines)
   - Get notifications (paginated)
   - Mark as read/unread
   - Delete notifications
   - Notification statistics

6. **`backend/controllers/user/authController.js`** (194 lines)
   - FCM token management (web/mobile)
   - User profile updates
   - Authentication handling

7. **`backend/controllers/admin/newsController.js`** (498 lines)
   - Automatic breaking news notifications
   - New news notifications

8. **`backend/controllers/admin/epaperController.js`** (177 lines)
   - Automatic e-paper notifications

#### 🛣️ Routes
9. **`backend/routes/user/notificationRoutes.js`** (12 lines)
   - Notification CRUD endpoints

10. **`backend/routes/user/authRoutes.js`** (29 lines)
    - FCM token management routes

11. **`backend/routes/debugRoutes.js`** (194 lines)
    - Testing and debugging endpoints

12. **`backend/server.js`** (109 lines)
    - Route mounting and initialization

### Frontend Files

#### 🌐 Web Push Notifications
13. **`frontend/public/firebase-messaging-sw.js`** (111 lines)
    - Background message handler
    - Notification display logic
    - Click action handling

14. **`frontend/src/firebase.js`** (29 lines)
    - Firebase client SDK configuration
    - FCM initialization

15. **`frontend/src/services/push-notification.service.js`** (185 lines)
    - FCM token generation and management
    - Service worker registration
    - Foreground notification handling
    - Permission management

#### 📱 Notification Management
16. **`frontend/src/modules/user/services/notificationService.js`** (92 lines)
    - API calls for notification CRUD
    - Authentication handling

17. **`frontend/src/modules/user/pages/NotificationPage.jsx`** (407 lines)
    - Notification list display
    - Read/unread management
    - Bulk operations
    - Pagination

18. **`frontend/src/modules/user/pages/ProfilePage.jsx`** (734 lines)
    - Notification settings management
    - Settings modal with toggles
    - Profile data integration

#### 🔐 Authentication
19. **`frontend/src/services/authService.js`** (231 lines)
    - User authentication
    - Profile updates (including notification settings)

---

## 🔄 Notification Flow Architecture

### Web Push Notification Flow
```
1. User Login → FCM Token Generation
   ↓
2. Token Saved → backend/services/firebaseAdmin.js
   ↓
3. Admin Creates News → Automatic Notification
   ↓
4. Firebase → Background Message (firebase-messaging-sw.js)
   ↓
5. Browser Popup + In-App Notification
   ↓
6. User Clicks → Navigate to Content
```

### Mobile Push Notification Flow
```
1. App Install → FCM Token Generation (Mobile App)
   ↓
2. Token Sent → /api/user/auth/save-fcm-token-mobile
   ↓
3. Admin Creates News → Automatic Notification
   ↓
4. Firebase → Mobile Push Notification
   ↓
5. User Receives → App Notification + In-App List
```

### In-App Notification Management
```
User Opens App → Load Notifications from API
   ↓
Notification List → Mark as Read on Click
   ↓
Settings Modal → Toggle Preferences
   ↓
Save to Backend → Update User Profile
```

---

## ⚙️ Configuration & Setup

### Environment Variables Required
```bash
# backend/.env
MONGODB_URI=mongodb://localhost:27017/hamarasamachar
JWT_SECRET=your-super-secure-jwt-secret-key-here
FIREBASE_SERVICE_ACCOUNT_PATH=./config/hamara-samachar-4b848-firebase-adminsdk-fbsvc-88218328ec.json

# frontend/.env
VITE_API_URL=http://localhost:5006/api
```

### Firebase Configuration
- **Service Account Key**: `backend/config/hamara-samachar-4b848-firebase-adminsdk-fbsvc-88218328ec.json`
- **Project ID**: `hamara-samachar-4b848`
- **VAPID Key**: Configured in push notification service

### Database Indexes (Auto-created)
```javascript
// Notification collection indexes
{ userId: 1, isRead: 1, sentAt: -1 }
{ userId: 1, type: 1 }
{ expiresAt: 1 } // TTL index for auto-expiration
```

---

## 🧪 Testing Procedures

### Web Testing
1. **FCM Token Generation**: Check browser console for token
2. **Permission Request**: Allow notifications when prompted
3. **Background Notifications**: Close tab, trigger test notification
4. **Service Worker**: Verify registration in DevTools

### Mobile Testing
1. **Token Registration**: Verify token sent to `/api/user/auth/save-fcm-token-mobile`
2. **Push Delivery**: Test notifications from Firebase Console
3. **Background/Foreground**: Test app closed vs open states

### API Testing
```bash
# Test breaking news
curl -X POST http://localhost:5006/api/debug/test-breaking-news

# Test custom notification
curl -X POST http://localhost:5006/api/debug/test-custom-notification/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"API Test"}'
```

---

## 🚨 Critical Monitoring Points

### Files to Monitor
- `backend/services/firebaseAdmin.js` - FCM connectivity
- `backend/services/pushNotificationService.js` - Notification logic
- `frontend/public/firebase-messaging-sw.js` - Background handling
- `frontend/src/services/push-notification.service.js` - Token management

### Error Scenarios
- FCM token expiration (auto-cleanup)
- Service worker registration failures
- Network connectivity issues
- Permission denials

### Performance Metrics
- Notification delivery rates
- Token registration success
- User engagement (open rates)
- API response times

---

## 📊 Database Schema

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  message: String,
  type: String (enum),
  data: {
    newsId: String,
    epaperId: String,
    category: String,
    url: String,
    priority: String
  },
  isRead: Boolean,
  sentAt: Date,
  readAt: Date,
  expiresAt: Date
}
```

### User Collection (FCM Related)
```javascript
{
  fcmTokens: [String],        // Web tokens
  fcmTokenMobile: [String],   // Mobile tokens
  notificationSettings: {
    pushNotifications: Boolean,
    breakingNews: Boolean,
    localNews: Boolean,
    sportsNews: Boolean,
    entertainmentNews: Boolean
  }
}
```

---

## 🔐 Security Considerations

- FCM tokens never exposed in client logs
- JWT authentication for all user endpoints
- Token validation before storage
- Automatic token cleanup for expired sessions
- Rate limiting on notification endpoints

---

## 📞 Support & Escalation

### Development Team
- **Primary**: MERN Stack Developer
- **Secondary**: Mobile App Developer
- **Emergency**: Firebase Console Access

### Common Issues & Solutions
- **No notifications**: Check FCM token registration
- **Token not saved**: Verify JWT authentication
- **SW not working**: Hard refresh and re-register
- **Permission denied**: Request permission on user interaction

---

## ✅ Implementation Checklist

### Backend ✅
- [x] Firebase Admin SDK configuration
- [x] Push notification service functions
- [x] Notification model and schema
- [x] API controllers and routes
- [x] Automatic notification triggers
- [x] Debug endpoints for testing

### Frontend ✅
- [x] Service worker for web notifications
- [x] Push notification service
- [x] Notification management UI
- [x] Settings management modal
- [x] Real-time notification loading

### Mobile Ready ✅
- [x] Mobile FCM token storage API
- [x] Cross-platform notification delivery
- [x] Backend support for mobile tokens

### Testing ✅
- [x] Web notification testing
- [x] API endpoint testing
- [x] Error handling verification
- [x] User preference management

---

*This comprehensive SOP ensures complete understanding and maintenance of the push notification system across web and mobile platforms. All endpoints, files, and workflows are documented for seamless operation and troubleshooting.*
# Push Notification System - Standard Operating Procedure (SOP).

## 📋 Document Information
- **Version**: 1.0
- **Last Updated**: December 23, 2025
- **System**: Hamara Samachar News Application
- **Technology**: Firebase Cloud Messaging (FCM)

## 🎯 Overview

This SOP documents the complete push notification system implementation for the Hamara Samachar news application. The system enables real-time notifications for breaking news, new articles, e-paper uploads, and custom notifications to web users.

### Key Features
- ✅ Firebase Cloud Messaging integration
- ✅ Toast notifications in-app
- ✅ Browser popup notifications
- ✅ FCM token management
- ✅ Database storage of user tokens
- ✅ Automatic notification triggers

---

## 🏗️ System Architecture

### Components
1. **Frontend (React + Vite)**
   - Firebase Client SDK
   - Service Worker for background notifications
   - Toast notification system
   - FCM token generation

2. **Backend (Node.js + Express)**
   - Firebase Admin SDK
   - FCM token storage in MongoDB
   - Notification sending APIs
   - User authentication

3. **Database (MongoDB)**
   - User FCM token storage
   - Notification preferences

4. **Firebase Console**
   - Project configuration
   - FCM message delivery

---

## ⚙️ Setup and Configuration

### Prerequisites
- Node.js 18+
- MongoDB running locally or cloud
- Firebase project with FCM enabled
- Service account key from Firebase

### 1. Environment Configuration

Create `backend/.env` file with the following variables:

```bash
# Environment
NODE_ENV=development
PORT=5006

# Database
MONGODB_URI=mongodb://localhost:27017/hamarasamachar

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=7d

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./config/hamara-samachar-4b848-firebase-adminsdk-fbsvc-88218328ec.json
```

### 2. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "hamara-samachar"
3. Enable Authentication, Firestore, and Cloud Messaging

#### Generate Service Account Key
1. Project Settings → Service Accounts
2. Generate new private key
3. Download JSON file
4. Place in `backend/config/` directory

#### Web App Configuration
1. Project Settings → General → Web apps
2. Add web app with domain
3. Copy Firebase config to `frontend/src/firebase.js`

### 3. VAPID Key Configuration

Get VAPID key from Firebase Console:
1. Project Settings → Cloud Messaging → Web Push certificates
2. Generate key pair
3. Add to `frontend/src/services/push-notification.service.js`

```javascript
const VAPID_KEY = 'your-vapid-key-here';
```

### 4. Service Worker Setup

Ensure `frontend/public/firebase-messaging-sw.js` is properly configured:
- Firebase SDK imports
- Background message handler
- Notification click handler

---

## 🚀 Implementation Steps

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Start Server
```bash
npm run dev
```

#### Verify Firebase Initialization
Check console logs for:
```
Firebase Admin initialized successfully
MongoDB Connected: localhost
Server running on port 5006
```

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
npm run dev
```

#### Verify Service Worker Registration
Check browser console for:
```
Service Worker registered successfully
Firebase Messaging initialized
```

### 3. User Authentication Flow

#### Login Process
1. User enters phone number
2. OTP sent via SMS
3. User verifies OTP
4. JWT token generated and stored
5. Push notifications initialized automatically

#### FCM Token Registration
- Automatic token generation after login
- Token sent to backend and stored in database
- Token updated on app reloads

---

## 🧪 Testing Procedures

### 1. Manual Testing

#### Test FCM Token Generation
```javascript
// In browser console
window.testNotifications.checkFCM()
// Should show: FCM Token exists: true
```

#### Test Toast Notifications
```javascript
// Test toast functionality
window.testNotifications.testFrontend()
// Should show toast notification on screen
```

#### Test Service Worker
```javascript
// Check service worker status
window.testNotifications.checkServiceWorker()
// Should show: activated
```

### 2. API Testing

#### Test Notification Endpoints
```bash
# Send to all users
curl -X POST http://localhost:5006/api/debug/test-notification \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","body":"API Test"}'

# Send to specific token
curl -X POST http://localhost:5006/api/debug/test-push \
  -H "Content-Type: application/json" \
  -d '{"token":"your-fcm-token","title":"Direct Test","body":"Token Test"}'
```

#### Test FCM Token Storage
```bash
# Save FCM token (requires JWT token)
curl -X POST http://localhost:5006/api/user/auth/save-fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"token":"your-fcm-token","platform":"web"}'
```

### 3. End-to-End Testing

#### Complete Notification Flow
1. User logs in to app
2. FCM token generated and saved
3. Admin publishes breaking news
4. Notification sent to all users
5. User receives both toast and browser notifications

---

## 📡 API Documentation

### User Authentication APIs

#### Send OTP
```http
POST /api/user/auth/send-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "purpose": "registration"
}
```

#### Verify OTP
```http
POST /api/user/auth/verify-otp
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "123456"
}
```

#### Save FCM Token
```http
POST /api/user/auth/save-fcm-token
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "fcm-token-here",
  "platform": "web"
}
```

### Notification APIs

#### Send to All Users
```http
POST /api/debug/test-notification
Content-Type: application/json

{
  "title": "Breaking News",
  "body": "Important update",
  "type": "breaking-news",
  "url": "/news/123"
}
```

#### Send to Specific Token
```http
POST /api/debug/test-push
Content-Type: application/json

{
  "token": "fcm-token-here",
  "title": "Direct Message",
  "body": "Personal notification"
}
```

### Admin APIs

#### Create News Article
```http
POST /api/admin/news
Authorization: Bearer <admin_jwt>
Content-Type: application/json

{
  "title": "News Title",
  "content": "News content...",
  "status": "published",
  "type": "breaking-news"
}
```
*Automatically triggers notifications*

#### Upload E-Paper
```http
POST /api/admin/epaper
Authorization: Bearer <admin_jwt>
Content-Type: multipart/form-data

file: epaper.pdf
```
*Automatically triggers e-paper notifications*

---

## 🔧 Troubleshooting Guide

### Issue: No Notifications Received

#### 1. Check Environment Variables
```bash
# Verify .env file exists and has correct values
cat backend/.env
```

#### 2. Check Database Connection
```bash
# Should show "MongoDB Connected"
# Check backend console logs
```

#### 3. Check Firebase Initialization
```javascript
// Browser console
window.testNotifications.checkFCM()
// Should show token exists
```

#### 4. Check Service Worker
```javascript
// Browser console
window.testNotifications.checkServiceWorker()
// Should show "activated"
```

### Issue: Notifications Sent But Not Received

#### 1. Browser Tab Focus
- **Problem**: Browser suppresses notifications when tab is active
- **Solution**: Close tab or minimize browser, then test

#### 2. FCM Token Mismatch
```javascript
// Compare tokens
window.testNotifications.compareTokens()
// Should show "Tokens match: true"
```

#### 3. Service Worker Issues
- Hard refresh page (Ctrl+F5)
- Check for service worker errors in console

### Issue: Cannot Save FCM Token

#### 1. Authentication Failed
- Check JWT token validity
- Verify user is logged in

#### 2. Database Connection
- Check MongoDB is running
- Verify connection string in .env

### Issue: Toast Notifications Not Working

#### 1. Component Not Mounted
- Ensure user is on OTPPage or logged-in pages
- Check if Toast component is rendered

#### 2. Callback Not Set
- Verify `setupForegroundNotificationHandler` is called with toast callback

---

## 📊 Monitoring and Maintenance

### Daily Checks

#### 1. Server Health
```bash
# Check if backend is running
curl http://localhost:5006/health

# Check database connection
# Monitor server logs for errors
```

#### 2. Firebase Console
- Check FCM message delivery statistics
- Monitor for delivery failures
- Review error reports

#### 3. Database Maintenance
```javascript
// Check token count
db.users.countDocuments({fcmTokens: {$exists: true}})

// Remove expired tokens periodically
db.users.updateMany(
  {},
  {$pull: {fcmTokens: "expired-token"}}
)
```

### Weekly Maintenance

#### 1. Clean Expired Tokens
- Remove invalid FCM tokens from database
- Update user notification preferences

#### 2. Monitor Performance
- Check notification delivery rates
- Monitor server response times
- Review error logs

### Monthly Reviews

#### 1. Firebase Usage
- Review FCM usage costs
- Optimize notification frequency
- Update Firebase configurations

#### 2. User Engagement
- Analyze notification open rates
- Adjust notification preferences
- A/B test notification content

---

## 🚨 Emergency Procedures

### System Down
1. Check server logs for errors
2. Verify database connectivity
3. Restart backend server
4. Check Firebase service status

### High Error Rates
1. Monitor Firebase Console for issues
2. Check FCM token validity
3. Review recent code changes
4. Rollback if necessary

### User Complaints
1. Test notification delivery manually
2. Check individual user FCM tokens
3. Verify browser compatibility
4. Provide user-specific troubleshooting

---

## 📈 Performance Optimization

### 1. Database Indexing
```javascript
// Index FCM tokens for faster queries
db.users.createIndex({ "fcmTokens": 1 })
db.users.createIndex({ "fcmTokenMobile": 1 })
```

### 2. Batch Processing
- Send notifications in batches for large user bases
- Implement rate limiting for FCM API calls
- Use Firebase Admin SDK's batch sending features

### 3. Token Cleanup
- Regularly remove invalid/expired tokens
- Implement token validation before sending
- Monitor FCM delivery failures

---

## 🔐 Security Considerations

### 1. Token Security
- Never expose FCM tokens in client-side logs
- Validate tokens server-side before storage
- Implement token rotation for security

### 2. API Security
- Use HTTPS for all notification APIs
- Validate JWT tokens for protected endpoints
- Implement rate limiting on notification endpoints

### 3. Privacy Compliance
- Obtain user consent for notifications
- Provide easy opt-out mechanisms
- Comply with notification regulations

---

## 📞 Support and Contact

### Technical Support
- **Primary Contact**: Development Team
- **Backup Contact**: System Administrator
- **Emergency**: +91-XXXXXXXXXX

### Documentation Updates
- Update this SOP after any system changes
- Document new features and modifications
- Review annually for accuracy

---

## ✅ Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Firebase project set up
- [ ] Service account key in place
- [ ] Database connection tested
- [ ] Frontend and backend tested

### Post-Deployment
- [ ] Notification delivery verified
- [ ] User feedback monitored
- [ ] Performance metrics reviewed
- [ ] Error logs monitored

### Maintenance
- [ ] Weekly health checks completed
- [ ] Monthly performance reviews done
- [ ] Security updates applied
- [ ] Documentation updated

---

*This SOP ensures reliable push notification delivery for the Hamara Samachar application. Follow all procedures carefully to maintain system integrity and user experience.*

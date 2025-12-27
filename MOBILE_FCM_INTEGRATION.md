# Mobile FCM Push Notification Integration Guide

## 📱 Overview

This guide provides complete instructions for mobile app developers to integrate FCM (Firebase Cloud Messaging) push notifications with the Hamara Samachar backend API.

## 🔗 API Endpoints

### Base URL
```
YOUR_API_BASE_URL/api/user/auth
```

### 1. OTP Verification with FCM Token (Recommended for Mobile)
```
POST /api/user/auth/verify-otp
```

**Request Body (Mobile Login with FCM Token):**
```json
{
  "phone": "9876543210",
  "otp": "123456",
  "purpose": "verification",
  "fcmToken": "MOBILE_FCM_TOKEN"  // FCM token generated on device
}
```

**Response:**
```json
{
  "success": true,
  "token": "JWT_AUTH_TOKEN",
  "user": { /* user object */ },
  "isProfileComplete": false,
  "fcmTokenSaved": true
}
```

### 2. General FCM Token Endpoint
```
POST /api/user/auth/save-fcm-token
```

**Request Body (Mobile Platform):**
```json
{
  "token": "mobile-fcm-token-string",
  "platform": "mobile",
  "userId": "REQUIRED-user-id"  // ← Mandatory for mobile platform
}
```

**Request Body (Web Platform):**
```json
{
  "token": "web-fcm-token-string",
  "platform": "web"
  // userId optional, determined from JWT token
}
```

### 2. Mobile-Specific FCM Token Endpoint
```
POST /api/user/auth/save-fcm-token-mobile
```

**Request Body (Same as Web - JWT Authentication):**
```json
{
  "token": "mobile-fcm-token-string",
  "platform": "mobile"
}
```

**Headers (Same as Web):**
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer JWT_TOKEN"  // ← Required (same as web)
}
```

**Note:** Mobile FCM tokens use the same authentication pattern as web tokens - JWT token in Authorization header.

## 👤 User Types Supported

The FCM token endpoints support both **authenticated users** and **guest users**:

### Authenticated Users
- Users who have logged in via OTP/mobile number
- FCM tokens are saved to their user account
- Can receive personalized notifications

### Guest Users
- Users who haven't logged in but have the app installed
- FCM tokens are saved to anonymous guest accounts
- Can receive general news notifications
- Each device gets a unique `deviceId`

## 📋 Request Headers

```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer USER_JWT_TOKEN"  // Required for authenticated users
}
```

## ✅ Success Response

```json
{
  "success": true,
  "message": "FCM token saved successfully"
}
```

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Token required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🔧 Implementation Examples

### Mobile FCM Token Strategy

**Important:** Mobile FCM tokens should be saved **the same way as web tokens** - after user authentication using JWT token. This maintains consistency between web and mobile implementations.

### Updated Login Flow:

1. **App Launch**: Generate FCM token
2. **User Login**: Send FCM token with OTP verification
3. **Token Saved**: Automatically associated with user account

### React Native Implementation

```javascript
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

class FCMService {
  // Initialize FCM
  async initializeFCM() {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      await this.getFCMToken();
    }
  }

  // Get FCM Token (store locally, don't save to server yet)
  async getFCMToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // Store locally for later use during login
        await AsyncStorage.setItem('fcmToken', fcmToken);
        return fcmToken;
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
    return null;
  }

  // Save token during login (not as separate API call)
  async saveTokenDuringLogin(phone, otp) {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');

      if (!fcmToken) {
        console.log('No FCM token available, generating new one...');
        await this.getFCMToken();
        // Wait a bit for token generation
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const updatedFcmToken = await AsyncStorage.getItem('fcmToken');

      const response = await fetch('YOUR_API_BASE_URL/api/user/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          otp: otp,
          purpose: 'verification',
          fcmToken: updatedFcmToken // Send FCM token with login
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Login successful with FCM token saved');
        console.log('FCM Token Saved:', result.fcmTokenSaved);

        // Store JWT token
        await AsyncStorage.setItem('userToken', result.token);
        await AsyncStorage.setItem('userId', result.user._id);

        return result;
      } else {
        console.log('Login failed:', result.message);
        throw new Error(result.message);
      }
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  }

  // Legacy method for guest users (if needed)
  async saveTokenForGuest(token) {
    try {
      const deviceId = await this.getDeviceId();

      const response = await fetch('YOUR_API_BASE_URL/api/user/auth/save-fcm-token-mobile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          deviceId: deviceId
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('Token saved for guest user');
        console.log('User Type:', result.userType);

        if (result.userType === 'guest') {
          await AsyncStorage.setItem('guestUserId', result.userId);
        }
      } else {
        console.log('Error saving guest token:', result.message);
      }
    } catch (error) {
      console.log('Network error:', error);
    }
  }

  // Get unique device identifier
  async getDeviceId() {
    // Use a library like react-native-device-info
    const deviceId = await DeviceInfo.getUniqueId();
    return deviceId || `device_${Date.now()}`;
  }

  // Handle token refresh
  async onTokenRefresh() {
    messaging().onTokenRefresh(async (token) => {
      console.log('FCM Token refreshed:', token);
      await this.saveTokenToServer(token);
      await AsyncStorage.setItem('fcmToken', token);
    });
  }

  // Handle incoming messages when app is in foreground
  async onMessage() {
    messaging().onMessage(async (remoteMessage) => {
      console.log('FCM Message received in foreground:', remoteMessage);

      // Handle notification display
      this.showNotification(remoteMessage);
    });
  }

  // Handle background messages
  async onBackgroundMessage() {
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('FCM Message received in background:', remoteMessage);
      // Background messages are handled automatically by FCM
    });
  }

  // Custom notification display
  showNotification(remoteMessage) {
    // Implement custom notification UI
    const { title, body } = remoteMessage.notification;
    const { image, newsId, type } = remoteMessage.data;

    // Show local notification or custom UI
    // You can use libraries like notifee or react-native-push-notification
  }
}

// Usage
const fcmService = new FCMService();
fcmService.initializeFCM();
fcmService.onTokenRefresh();
fcmService.onMessage();
fcmService.onBackgroundMessage();
```

### Flutter Implementation

```dart
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class FCMService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initializeFCM() async {
    // Request permission
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      print('User granted permission');
      await getFCMToken();
    } else {
      print('User declined or has not accepted permission');
    }

    // Handle token refresh
    _firebaseMessaging.onTokenRefresh.listen((String token) {
      print('FCM Token refreshed: $token');
      saveTokenToServer(token);
    });
  }

  Future<String?> getFCMToken() async {
    try {
      String? token = await _firebaseMessaging.getToken();
      if (token != null) {
        print('FCM Token: $token');
        await saveTokenToServer(token);
      }
      return token;
    } catch (e) {
      print('Error getting FCM token: $e');
      return null;
    }
  }

  Future<Map<String, dynamic>> saveTokenDuringLogin(String phone, String otp) async {
    try {
      String? fcmToken = await getStoredFCMToken();

      if (fcmToken == null) {
        print('No FCM token available, generating new one...');
        fcmToken = await getFCMToken();
        if (fcmToken != null) {
          await storeFCMToken(fcmToken);
        }
      }

      final response = await http.post(
        Uri.parse('YOUR_API_BASE_URL/api/user/auth/verify-otp'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'phone': phone,
          'otp': otp,
          'purpose': 'verification',
          'fcmToken': fcmToken, // Send FCM token with login
        }),
      );

      final result = jsonDecode(response.body);
      if (result['success']) {
        print('Login successful with FCM token saved');
        print('FCM Token Saved: ${result['fcmTokenSaved']}');

        // Store JWT token and user data
        await storeUserToken(result['token']);
        await storeUserId(result['user']['_id']);

        return result;
      } else {
        print('Login failed: ${result['message']}');
        throw Exception(result['message']);
      }
    } catch (e) {
      print('Login error: $e');
      throw e;
    }
  }

  // Legacy method for guest users (if needed)
  Future<void> saveTokenForGuest(String token) async {
    try {
      String deviceId = await getDeviceId();

      final response = await http.post(
        Uri.parse('YOUR_API_BASE_URL/api/user/auth/save-fcm-token-mobile'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonEncode({
          'token': token,
          'deviceId': deviceId,
        }),
      );

      final result = jsonDecode(response.body);
      if (result['success']) {
        print('Token saved for guest user');
        print('User Type: ${result['userType']}');

        if (result['userType'] == 'guest') {
          await saveGuestUserId(result['userId']);
        }
      } else {
        print('Error saving guest token: ${result['message']}');
      }
    } catch (e) {
      print('Network error: $e');
    }
  }

  // Handle foreground messages
  void onMessage() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foreground!');
      print('Message data: ${message.data}');

      if (message.notification != null) {
        print('Message also contained a notification: ${message.notification}');
        showNotification(message);
      }
    });
  }

  // Handle background messages
  void onBackgroundMessage() {
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  // Background message handler (must be top-level function)
  Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
    print('Handling a background message: ${message.messageId}');
    // Background messages are handled automatically
  }

  void showNotification(RemoteMessage message) {
    // Implement custom notification display
    // Use flutter_local_notifications or other packages
  }
}

// Usage
final fcmService = FCMService();
await fcmService.initializeFCM();
fcmService.onMessage();
fcmService.onBackgroundMessage();
```

### Native Android (Java/Kotlin)

```java
// AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />

<application>
    <!-- Firebase services -->
    <service
        android:name=".MyFirebaseMessagingService"
        android:exported="false">
        <intent-filter>
            <action android:name="com.google.firebase.MESSAGING_EVENT" />
        </intent-filter>
    </service>
</application>
```

```kotlin
// MyFirebaseMessagingService.kt
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "Refreshed token: $token")
        sendTokenToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Handle foreground messages
        Log.d(TAG, "From: ${remoteMessage.from}")

        // Check if message contains a notification payload
        remoteMessage.notification?.let {
            Log.d(TAG, "Message Notification Body: ${it.body}")
            showNotification(it, remoteMessage.data)
        }
    }

    private fun sendTokenToServer(token: String) {
        // Get stored user data
        val userToken = getStoredUserToken() // JWT token
        val userId = getStoredUserId() // Optional

        val jsonObject = JSONObject().apply {
            put("token", token)
            put("platform", "mobile")
            if (userId != null) put("userId", userId)
        }

        val request = JsonObjectRequest(
            Request.Method.POST,
            "YOUR_API_BASE_URL/api/user/auth/save-fcm-token",
            jsonObject,
            { response ->
                Log.d(TAG, "Token saved successfully")
            },
            { error ->
                Log.e(TAG, "Error saving token: $error")
            }
        ).apply {
            userToken?.let {
                headers["Authorization"] = "Bearer $it"
            }
        }

        // Add to request queue
        Volley.newRequestQueue(this).add(request)
    }

    private fun showNotification(notification: RemoteMessage.Notification, data: Map<String, String>) {
        // Create notification channel (Android 8.0+)
        createNotificationChannel()

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_IMMUTABLE)

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(notification.title)
            .setContentText(notification.body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        // Add image if available
        data["image"]?.let { imageUrl ->
            // Load and set large icon or big picture style
            // Implementation depends on your image loading library
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notification.hashCode(), notificationBuilder.build())
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "News Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Receive news notifications"
                enableLights(true)
                lightColor = Color.BLUE
                enableVibration(true)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    companion object {
        private const val TAG = "MyFirebaseMsgService"
        private const val CHANNEL_ID = "news_channel"
    }
}
```

## 📱 Notification Data Structure

When your app receives a push notification, the data will include:

```json
{
  "notification": {
    "title": "📰 नई खबर",
    "body": "Breaking news title...",
    "image": "https://example.com/news-image.jpg"
  },
  "data": {
    "type": "new_news",
    "newsId": "507f1f77bcf86cd799439011",
    "image": "https://example.com/news-image.jpg",
    "content": "First 20 words of news content...",
    "category": "politics",
    "url": "/news/507f1f77bcf86cd799439011",
    "timestamp": "1640995200000"
  }
}
```

## 🔄 Token Management

### Token Refresh Handling
- FCM tokens can change, so always listen for token refresh events
- Update the server whenever token changes
- Store token locally for offline access

### User Authentication
- Include JWT token in Authorization header for authenticated requests
- Handle token expiry and refresh
- Support guest users (optional userId)

## 🧪 Testing

### Test Token Registration
```bash
curl -X POST YOUR_API_BASE_URL/api/user/auth/save-fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "token": "test-fcm-token",
    "platform": "mobile"
  }'
```

### Test Push Notification
1. Register FCM token
2. Create/publish news in admin panel
3. Check if notification appears on mobile device

## 🚨 Important Notes

1. **Permissions**: Request notification permissions on app launch
2. **Background**: FCM automatically handles background messages
3. **Foreground**: Manually handle foreground messages for custom UI
4. **Token Refresh**: Always listen for token refresh events
5. **Platform**: Use `platform: "mobile"` for proper token storage
6. **Images**: Handle image loading/display in notification UI
7. **User Context**: Include user authentication for personalized notifications

## 📞 Support

If you encounter issues:
1. Check API endpoint URLs
2. Verify JWT token authentication
3. Ensure proper FCM SDK integration
4. Test with both authenticated and guest users
5. Check device notification permissions

For backend-related issues, contact the backend developer.
For mobile app issues, refer to Firebase documentation and your app's notification implementation.

---

## 🔄 Correct Mobile FCM Implementation (Same as Web)

### Mobile FCM Token Flow (Same as Web):

```javascript
// 1. Generate FCM token on app launch
const fcmToken = await messaging().getToken();
await AsyncStorage.setItem('fcmToken', fcmToken);

// 2. User logs in (OTP verification)
const loginResult = await verifyOTP(phone, otp);

// 3. After successful login, save FCM token (same as web)
await saveFCMTokenAfterLogin();

// 4. Implementation:
async function saveFCMTokenAfterLogin() {
  const userToken = await AsyncStorage.getItem('userToken');
  const fcmToken = await AsyncStorage.getItem('fcmToken');

  if (!userToken || !fcmToken) return;

  await fetch('/api/user/auth/save-fcm-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`  // Same as web
    },
    body: JSON.stringify({
      token: fcmToken,
      platform: 'mobile'  // Separate from web
    })
  });
}
```

### Key Points:
- ✅ **Same authentication pattern as web**
- ✅ **JWT token required in headers**
- ✅ **Separate platform identification**
- ✅ **No mixing with login flow**
- ✅ **Called after successful login**

This ensures mobile FCM tokens are generated and saved exactly like web tokens! 🎯

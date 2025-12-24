import express from 'express';
import {
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  deleteAccount,
  saveFCMToken,
  saveFCMTokenMobile,
  removeFCMToken
} from '../../controllers/user/authController.js';
import { userAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', userAuth, getMe);
router.put('/profile', userAuth, updateProfile);
router.delete('/account', userAuth, deleteAccount);

// FCM Token routes
router.post('/save-fcm-token', saveFCMToken);
router.post('/save-fcm-token-mobile', saveFCMTokenMobile);
router.delete('/remove-fcm-token', userAuth, removeFCMToken);

export default router;


import express from 'express';
import {
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile,
  deleteAccount
} from '../../controllers/user/authController.js';
import { userAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/me', userAuth, getMe);
router.put('/profile', userAuth, updateProfile);
router.delete('/account', userAuth, deleteAccount);

export default router;


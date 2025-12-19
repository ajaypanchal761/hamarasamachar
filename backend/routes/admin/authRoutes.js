import express from 'express';
import {
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} from '../../controllers/admin/authController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', adminAuth, getMe);
router.put('/profile', adminAuth, updateProfile);
router.put('/change-password', adminAuth, changePassword);

export default router;


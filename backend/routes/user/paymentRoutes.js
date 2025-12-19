import express from 'express';
import {
  createPaymentOrder,
  verifyPaymentAndSubscribe,
  getSubscriptionStatus,
  getPaymentHistory
} from '../../controllers/user/paymentController.js';
import { userAuth } from '../../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(userAuth);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPaymentAndSubscribe);
router.get('/subscription-status', getSubscriptionStatus);
router.get('/history', getPaymentHistory);

export default router;


import express from 'express';
import { userAuth } from '../../middlewares/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats
} from '../../controllers/user/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(userAuth);

router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;

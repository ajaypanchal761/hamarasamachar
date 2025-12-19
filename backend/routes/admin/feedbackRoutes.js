import express from 'express';
import {
  getAllFeedbacks,
  getFeedbackById,
  updateStatus,
  deleteFeedback,
  getUnreadCount
} from '../../controllers/admin/feedbackController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllFeedbacks);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getFeedbackById);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteFeedback);

export default router;


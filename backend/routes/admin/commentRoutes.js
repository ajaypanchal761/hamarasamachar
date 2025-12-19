import express from 'express';
import {
  getAllComments,
  updateCommentStatus,
  deleteComment,
  replyToComment,
  getCommentStats
} from '../../controllers/admin/commentController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllComments);
router.get('/stats', getCommentStats);
router.patch('/:id/status', updateCommentStatus);
router.delete('/:id', deleteComment);
router.post('/:id/reply', replyToComment);

export default router;


import express from 'express';
import {
  getAllRatings,
  getRatingStats,
  addReply,
  deleteRating
} from '../../controllers/admin/ratingController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllRatings);
router.get('/stats', getRatingStats);
router.post('/:id/reply', addReply);
router.delete('/:id', deleteRating);

export default router;


import express from 'express';
import {
  createRating,
  getMyRating
} from '../../controllers/user/ratingController.js';
import { userAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.post('/', userAuth, createRating);
router.get('/me', userAuth, getMyRating);

export default router;


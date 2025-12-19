import express from 'express';
import { createFeedback, getUserFeedback } from '../../controllers/user/feedbackController.js';
import { optionalUserAuth, userAuth } from '../../middlewares/auth.js';

const router = express.Router();

// Public route - no authentication required for creating feedback
router.post('/', optionalUserAuth, createFeedback);

// Protected route - requires authentication for getting user's own feedback
router.get('/me', userAuth, getUserFeedback);

export default router;


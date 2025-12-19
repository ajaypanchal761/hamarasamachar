import express from 'express';
import {
  getActivePlans,
  getPlanById
} from '../../controllers/user/planController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getActivePlans);
router.get('/:id', getPlanById);

export default router;


import express from 'express';
import { createLead } from '../../controllers/user/franchiseLeadController.js';

const router = express.Router();

// Public route - no authentication required
router.post('/', createLead);

export default router;


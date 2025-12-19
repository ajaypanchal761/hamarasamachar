import express from 'express';
import { getDashboardStats } from '../../controllers/admin/dashboardController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/stats', getDashboardStats);

export default router;



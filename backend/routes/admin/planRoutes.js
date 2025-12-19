import express from 'express';
import {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  getAllSubscribers,
  getPlanStats,
  updateSubscription,
  deleteSubscription
} from '../../controllers/admin/planController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

router.get('/stats', getPlanStats);
router.get('/subscribers', getAllSubscribers);
router.put('/subscribers/:id', updateSubscription);
router.delete('/subscribers/:id', deleteSubscription);
router.get('/', getAllPlans);
router.get('/:id', getPlanById);
router.post('/', createPlan);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

export default router;


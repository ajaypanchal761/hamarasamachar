import express from 'express';
import {
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  deleteLead,
  getLeadStats
} from '../../controllers/admin/franchiseLeadController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

router.get('/stats', getLeadStats);
router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.put('/:id/status', updateLeadStatus);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;


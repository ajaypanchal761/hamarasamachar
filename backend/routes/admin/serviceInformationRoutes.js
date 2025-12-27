import express from 'express';
import {
  getAllServiceInformation,
  getServiceInformationById,
  createServiceInformation,
  updateServiceInformation,
  deleteServiceInformation
} from '../../controllers/admin/serviceInformationController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllServiceInformation);
router.get('/:id', getServiceInformationById);
router.post('/', createServiceInformation);
router.put('/:id', updateServiceInformation);
router.delete('/:id', deleteServiceInformation);

export default router;

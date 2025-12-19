import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  bulkUpdateStatus,
  bulkDelete,
  getUserStats
} from '../../controllers/admin/userController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);
router.delete('/:id', deleteUser);
router.patch('/bulk-status', bulkUpdateStatus);
router.delete('/bulk-delete', bulkDelete);

export default router;


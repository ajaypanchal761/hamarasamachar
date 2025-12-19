import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories
} from '../../controllers/admin/categoryController.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);
router.put('/reorder', reorderCategories);

export default router;


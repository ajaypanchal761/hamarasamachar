import express from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  bulkDeleteNews
} from '../../controllers/admin/newsController.js';
import { adminAuth } from '../../middlewares/auth.js';
import { uploadMedia } from '../../middlewares/upload.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', uploadMedia.single('media'), createNews);
router.put('/:id', uploadMedia.single('media'), updateNews);
router.delete('/:id', deleteNews);
router.delete('/bulk-delete', bulkDeleteNews);

export default router;


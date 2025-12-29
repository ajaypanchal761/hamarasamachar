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

// Configure multer to accept both thumbnail and media files
const uploadFields = uploadMedia.fields([
  { name: 'thumbnailFile', maxCount: 1 },
  { name: 'mediaFile', maxCount: 1 }
]);

router.get('/', getAllNews);
router.get('/:id', getNewsById);
router.post('/', uploadFields, createNews);
router.put('/:id', uploadFields, updateNews);
router.delete('/:id', deleteNews);
router.delete('/bulk-delete', bulkDeleteNews);

export default router;


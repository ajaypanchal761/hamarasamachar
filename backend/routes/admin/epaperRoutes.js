import express from 'express';
import {
  getAllEpapers,
  uploadEpaper,
  deleteEpaper
} from '../../controllers/admin/epaperController.js';
import { adminAuth } from '../../middlewares/auth.js';
import { uploadEpaperFiles } from '../../middlewares/epaperUpload.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllEpapers);
router.post('/', uploadEpaperFiles, uploadEpaper);
router.delete('/:id', deleteEpaper);

export default router;


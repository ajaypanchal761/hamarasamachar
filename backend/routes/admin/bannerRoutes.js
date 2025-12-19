import express from 'express';
import {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  getBannersByPosition
} from '../../controllers/admin/bannerController.js';
import { adminAuth } from '../../middlewares/auth.js';
import { uploadMedia } from '../../middlewares/upload.js';

const router = express.Router();

router.use(adminAuth);

router.get('/', getAllBanners);
router.get('/position/:position', getBannersByPosition);
router.get('/:id', getBannerById);
router.post('/', uploadMedia.single('media'), createBanner);
router.put('/:id', uploadMedia.single('media'), updateBanner);
router.delete('/:id', deleteBanner);

export default router;


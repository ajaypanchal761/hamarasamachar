import express from 'express';
import {
  getAllNews,
  getNewsById,
  getBreakingNews,
  getBanners
} from '../../controllers/user/newsController.js';
import { optionalUserAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', optionalUserAuth, getAllNews);
router.get('/breaking', getBreakingNews);
router.get('/:id', optionalUserAuth, getNewsById);
router.get('/banners/:position', getBanners);

export default router;


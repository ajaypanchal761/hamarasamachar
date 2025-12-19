import express from 'express';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  checkBookmark
} from '../../controllers/user/bookmarkController.js';
import { userAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(userAuth);

router.get('/', getBookmarks);
router.post('/', addBookmark);
router.delete('/:newsId', removeBookmark);
router.get('/check/:newsId', checkBookmark);

export default router;


import express from 'express';
import {
  getCommentsByNews,
  createComment
} from '../../controllers/user/commentController.js';
import { userAuth, optionalUserAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/news/:newsId', optionalUserAuth, getCommentsByNews);
router.post('/', userAuth, createComment);

export default router;


import express from 'express';
import {
  getAllEpapers,
  getEpaperById
} from '../../controllers/user/epaperController.js';
import { optionalUserAuth, userAuth } from '../../middlewares/auth.js';

const router = express.Router();

// Get all epapers - public but can check subscription if user is logged in
router.get('/', optionalUserAuth, getAllEpapers);
// Get epaper by ID - requires authentication and subscription
router.get('/:id', userAuth, getEpaperById);

export default router;


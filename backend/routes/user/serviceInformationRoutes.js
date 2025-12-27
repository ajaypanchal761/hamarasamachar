import express from 'express';
import {
  getUserServiceInformation,
  deleteUserServiceInformation
} from '../../controllers/user/serviceInformationController.js';
import { userAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.use(userAuth);

router.get('/', getUserServiceInformation);
router.delete('/:id', deleteUserServiceInformation);

export default router;

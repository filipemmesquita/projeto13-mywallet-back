import { loginUser, createUser, logoutUser } from '../controllers/authController.js';
import { Router } from 'express';

const router = Router();

router.post('/login', loginUser);
router.post('/signup', createUser);
router.delete('/logout',logoutUser)

export default router;

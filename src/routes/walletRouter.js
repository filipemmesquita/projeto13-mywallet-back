import { getEntry, createEntry } from '../controllers/walletController.js';
import validateUser from '../middlewares/validateUser.js';
import { Router } from 'express';

const router = Router();

router.get('/entries', validateUser, getEntry);
router.post('/entries', createEntry);

export default router;

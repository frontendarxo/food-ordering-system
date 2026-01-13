import Router from 'express';
import { login, logout, me } from '../controllers/auth.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;


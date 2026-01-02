import Router from 'express';
import { loginUser, registerUser, getCurrentUser, logoutUser, updateUserName, updateUserPassword } from '../controllers/user.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authenticate, getCurrentUser);
router.post('/logout', authenticate, logoutUser);
router.patch('/update-name', authenticate, updateUserName);
router.patch('/update-password', authenticate, updateUserPassword);

export default router;
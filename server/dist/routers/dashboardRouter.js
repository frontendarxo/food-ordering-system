import Router from 'express';
import { authenticate } from '../middlewares/auth.js';
import { getAdmin, getWorker } from '../controllers/dashboard.js';
const router = Router();
router.use(authenticate);
router.get('/admin', getAdmin);
router.get('/worker', getWorker);
export default router;

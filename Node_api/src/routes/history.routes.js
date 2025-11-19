import { Router } from 'express';
import { getHistory } from '../controllers/history.controller.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', checkAuth, getHistory);

export default router;
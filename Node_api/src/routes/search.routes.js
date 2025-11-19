import { Router } from 'express';
import { search } from '../controllers/search.controller.js';
import { checkAuth } from '../middleware/auth.middleware.js';
const router = Router();

router.get('/', checkAuth, search);

export default router;
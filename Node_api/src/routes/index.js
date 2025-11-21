import { Router } from 'express';
import authRoutes from './auth.routes.js';
import searchRoutes from './search.routes.js'
import uploadRoutes from './upload.routes.js'
import historyRoutes from './history.routes.js'
import tagsRoutes from './tags.routes.js'
import documentsRoutes from './documents.routes.js';

const router = Router();
router.use('/auth', authRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);
router.use('/history', historyRoutes);
router.use('/tags', tagsRoutes);
router.use('/documents', documentsRoutes);

export default router;
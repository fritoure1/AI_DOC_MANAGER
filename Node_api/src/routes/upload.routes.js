import { Router } from 'express';
import multer from 'multer';
import { upload } from '../controllers/upload.controller.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router=Router();

const storage = multer.memoryStorage()
const uploadMiddleware= multer({storage:storage});

router.post('/', checkAuth, uploadMiddleware.single('file'), upload);

export default router;
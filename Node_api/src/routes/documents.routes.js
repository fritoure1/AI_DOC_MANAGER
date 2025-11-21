import { Router } from 'express';
import { getUserDocuments, getDocumentFile } from '../controllers/documents.controller.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(checkAuth); 

router.get('/', getUserDocuments);

router.get('/:id/download', getDocumentFile);

export default router;
import { Router } from 'express';
import { getUserDocuments, getDocumentFile, deleteDocument } from '../controllers/documents.controller.js'; // <-- Import
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();
router.use(checkAuth);

router.get('/', getUserDocuments);
router.get('/:id/download', getDocumentFile);
router.delete('/:id', deleteDocument);

export default router;
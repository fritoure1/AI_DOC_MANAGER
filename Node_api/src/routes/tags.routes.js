import { Router } from 'express';
import { getTags, createTag, linkTag } from '../controllers/tags.controller.js';
import { checkAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(checkAuth);

router.get('/', getTags);        
router.post('/', createTag);
router.post('/link', linkTag); 

export default router;

import { Router } from 'express';
import { login, refreshToken } from '../controllers/auth.controller';

const router = Router();

// Routes publiques
router.post('/login', login);
router.post('/refresh-token', refreshToken);

export default router;
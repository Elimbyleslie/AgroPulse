
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

// Routes publiques
router.post('/', createUser);

// Routes protégées
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

// Routes admin seulement
router.get('/', authenticate, authorize(['ADMIN']), getAllUsers);
router.get('/:id', authenticate, authorize(['ADMIN']), getUserById);
router.put('/:id', authenticate, authorize(['ADMIN']), updateUser);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteUser);


export default router;
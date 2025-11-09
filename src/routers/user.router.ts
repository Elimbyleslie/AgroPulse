
import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  assignRole,
  removeRole,
  getUserRoles
} from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createdUserSchema } from '../validations/user.validation.js';
import { validator } from '../middlewares/validator.middleware.js';
import { isAdmin } from "../middlewares/role.middleware.js";
const router = Router();

// Routes publiques
router.post('/', validator(createdUserSchema),createUser);

// Routes protégées
router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateUserProfile);

// Routes admin seulement
router.get('/', authenticate, authorize(['ADMIN']), getAllUsers);
router.get('/:id', authenticate, authorize(['ADMIN']), getUserById);
router.put('/:id', authenticate, authorize(['ADMIN']), updateUser);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteUser);
router.post("/:id/roles", authenticate, isAdmin, assignRole);
router.delete("/:id/roles", authenticate, isAdmin, removeRole);
router.get("/:id/roles", authenticate, isAdmin, getUserRoles);

export default router;
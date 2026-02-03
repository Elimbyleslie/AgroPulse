import { Router } from "express";
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
  getUserRoles,
} from "../controllers/user.controller.js";

import { authenticate } from "../middlewares/auth.js";
import { validator } from "../middlewares/validator.middleware.js";
import { createdUserSchema } from "../validations/user.validation.js";
import { authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", validator(createdUserSchema), createUser);
router.get("/profile", getUserProfile);

router.put("/profile", updateUserProfile);

// ============================================
// ROUTES ADMIN / PERMISSIONS
// ============================================
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_USER]),
  getAllUsers,
);

router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_USER]),
  getUserById,
);

router.put(
  "/:id",
  updateUser,
);

router.delete(
  "/:id",
  deleteUser,
);

// ============================================
// ASSIGNATION DE ROLES (admin seulement)
// ============================================
router.post(
  "/:id/roles",
  authenticate,
  authorizePermission([Permission.ASSIGN_ROLE]), // Crée une permission spéciale si besoin
  assignRole,
);

router.delete(
  "/:id/roles",
  authenticate,
  authorizePermission([Permission.REMOVE_ROLE]), // Crée une permission spéciale si besoin
  removeRole,
);

router.get(
  "/:id/roles",
  authenticate,
  authorizePermission([Permission.READ_USER_ROLES]),
  getUserRoles,
);

export default router;

import { Router } from "express";
import {
  createAnimal,
  getAllAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
  assignAnimal,
  getAnimalHistory,
  unassignAnimal,
} from "../controllers/animalController.js";
import {
  createAnimalSchema,
  updateAnimalSchema,
} from "../validations/animal.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { uploadAnimalPhoto } from "../middlewares/uploadMiddleware.js";
const router = Router();

// CREATE => l'utilisateur doit avoir CREATE_ANIMAL
// ✅ À GARDER ET CORRIGER
router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_ANIMAL]),
  uploadAnimalPhoto.single('photo'), // MULTER EN PREMIER
  validator(createAnimalSchema),      // VALIDATOR EN DEUXIÈME
  createAnimal
);
// READ ALL => l'utilisateur doit avoir READ_ANIMAL
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_ANIMAL]),
  getAllAnimals,
);

// READ ONE => READ_ANIMAL
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_ANIMAL]),
  getAnimalById,
);

// UPDATE => UPDATE_ANIMAL
router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_ANIMAL]),
  uploadAnimalPhoto.single('photo'),
  validator(updateAnimalSchema),
  updateAnimal,
);
// DELETE => DELETE_ANIMAL
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_ANIMAL]),
  deleteAnimal,
);
// ASSIGN ANIMAL TO LOT => UPDATE_ANIMAL
router.post(
  "/assign/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_ANIMAL]),
  assignAnimal,
);
// UNASSIGN ANIMAL FROM LOT => UPDATE_ANIMAL
router.post(
  "/unassign/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_ANIMAL]),
  unassignAnimal,
);
router.get('/:id/history', 
  authenticate,
  authorizePermission([Permission.READ_ANIMAL]),
  getAnimalHistory);


export default router;

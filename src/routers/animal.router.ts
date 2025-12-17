import { Router } from "express";
import {
  createAnimal,
  getAllAnimals,
  getAnimalById,
  updateAnimal,
  deleteAnimal,
} from "../controllers/animalController.js";
import { createAnimalSchema, updateAnimalSchema } from "../validations/animal.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate,authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

// CREATE => l'utilisateur doit avoir CREATE_ANIMAL
router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_ANIMAL]),
  validator(createAnimalSchema),
  createAnimal
);

// READ ALL => l'utilisateur doit avoir READ_ANIMAL
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_ANIMAL]),
  getAllAnimals
);

// READ ONE => READ_ANIMAL
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_ANIMAL]),
  getAnimalById
);

// UPDATE => UPDATE_ANIMAL
router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_ANIMAL]),
  validator(updateAnimalSchema),
  updateAnimal
);

// DELETE => DELETE_ANIMAL
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_ANIMAL]),
  deleteAnimal
);

export default router;

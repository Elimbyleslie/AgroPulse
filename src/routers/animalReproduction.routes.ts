import { Router } from "express";
import {
  createAnimalReproduction,
  getAllAnimalReproductions,
  getAnimalReproductionById,
  updateAnimalReproduction,
  deleteAnimalReproduction,
} from "../controllers/AnimalReproductionController.js";

import {
  createAnimalReproductionSchema,
  updateAnimalReproductionSchema,
} from "../validations/animalReproduction.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_ANIMAL_REPRODUCTION]), validator(createAnimalReproductionSchema), createAnimalReproduction);
router.get("/", authenticate, authorizePermission([Permission.READ_ANIMAL_REPRODUCTION]), getAllAnimalReproductions);
router.get("/:id", authenticate, authorizePermission([Permission.READ_ANIMAL_REPRODUCTION]), getAnimalReproductionById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_ANIMAL_REPRODUCTION]), validator(updateAnimalReproductionSchema), updateAnimalReproduction);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_ANIMAL_REPRODUCTION]), deleteAnimalReproduction);
export default router;

import { Router } from "express";
import {
  createAnimalDeath,
  getAllAnimalDeaths,
  getAnimalDeathById,
  updateAnimalDeath,
  deleteAnimalDeath,
} from "../controllers/AnimalDeathController.js";

import { validator } from "../middlewares/validator.middleware.js";
import {
  createAnimalDeathSchema,
  updateAnimalDeathSchema,
} from "../validations/animalDeath.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_ANIMAL_DEATH]), validator(createAnimalDeathSchema), createAnimalDeath);
router.get("/", authenticate, authorizePermission([Permission.READ_ANIMAL_DEATH]), getAllAnimalDeaths);
router.get("/:id", authenticate, authorizePermission([Permission.READ_ANIMAL_DEATH]), getAnimalDeathById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_ANIMAL_DEATH]), validator(updateAnimalDeathSchema), updateAnimalDeath);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_ANIMAL_DEATH]), deleteAnimalDeath);

export default router;

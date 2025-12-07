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

const router = Router();

router.post("/", validator(createAnimalDeathSchema), createAnimalDeath);
router.get("/", getAllAnimalDeaths);
router.get("/:id", getAnimalDeathById);
router.put("/:id", validator(updateAnimalDeathSchema), updateAnimalDeath);
router.delete("/:id", deleteAnimalDeath);

export default router;

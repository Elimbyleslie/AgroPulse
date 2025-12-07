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

import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createAnimalReproductionSchema), createAnimalReproduction);
router.get("/", getAllAnimalReproductions);
router.get("/:id", getAnimalReproductionById);
router.put("/:id", validator(updateAnimalReproductionSchema), updateAnimalReproduction);
router.delete("/:id", deleteAnimalReproduction);

export default router;

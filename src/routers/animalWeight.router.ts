import { Router } from "express";
import {
  createAnimalWeight,
  getAllAnimalWeights,
  getAnimalWeightById,
  updateAnimalWeight,
  deleteAnimalWeight,
} from "../controllers/AnimalWeightController.js";
import { createAnimalWeightSchema, updateAnimalWeightSchema } from "../validations/animalWeight.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createAnimalWeightSchema), createAnimalWeight);
router.get("/", getAllAnimalWeights);
router.get("/:id", getAnimalWeightById);
router.put("/:id", validator(updateAnimalWeightSchema), updateAnimalWeight);
router.delete("/:id", deleteAnimalWeight);

export default router;

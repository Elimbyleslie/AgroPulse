import { Router } from "express";
import {
  createAnimalTreatment,
  getAllAnimalTreatments,
  getAnimalTreatmentById,
  updateAnimalTreatment,
  deleteAnimalTreatment,
} from "../controllers/animalTreatmentController.js";

import {validator} from "../middlewares/validator.middleware.js";
import {
  createAnimalTreatmentSchema,
  updateAnimalTreatmentSchema,
} from "../validations/animalTreatement.js";

const router = Router();

router.post("/", validator(createAnimalTreatmentSchema), createAnimalTreatment);
router.get("/", getAllAnimalTreatments);
router.get("/:id", getAnimalTreatmentById);
router.put("/:id", validator(updateAnimalTreatmentSchema), updateAnimalTreatment);
router.delete("/:id", deleteAnimalTreatment);

export default router;

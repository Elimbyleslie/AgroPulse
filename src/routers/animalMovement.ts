import { Router } from "express";
import {
  createAnimalMovement,
  getAllAnimalMovements,
  getAnimalMovementById,
  updateAnimalMovement,
  deleteAnimalMovement,
} from "../controllers/AnimalMovementController.js";
import { createAnimalMovementSchema, updateAnimalMovementSchema } from "../validations/animalMouvement.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createAnimalMovementSchema), createAnimalMovement);
router.get("/", getAllAnimalMovements);
router.get("/:id", getAnimalMovementById);
router.put("/:id", validator(updateAnimalMovementSchema), updateAnimalMovement);
router.delete("/:id", deleteAnimalMovement);

export default router;

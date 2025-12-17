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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_WEIGHT]), validator(createAnimalWeightSchema), createAnimalWeight);
router.get("/", authenticate, authorizePermission([Permission.READ_WEIGHT]), getAllAnimalWeights);
router.get("/:id", authenticate, authorizePermission([Permission.READ_WEIGHT]), getAnimalWeightById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_WEIGHT]), validator(updateAnimalWeightSchema), updateAnimalWeight);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_WEIGHT]), deleteAnimalWeight);
export default router;

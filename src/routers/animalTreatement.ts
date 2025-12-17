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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_TREATMENT]), validator(createAnimalTreatmentSchema), createAnimalTreatment);
router.get("/", authenticate, authorizePermission([Permission.READ_TREATMENT]), getAllAnimalTreatments);
router.get("/:id", authenticate, authorizePermission([Permission.READ_TREATMENT]), getAnimalTreatmentById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_TREATMENT]), validator(updateAnimalTreatmentSchema), updateAnimalTreatment);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_TREATMENT]), deleteAnimalTreatment);

export default router;

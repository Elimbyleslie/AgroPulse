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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_MOVEMENT]), validator(createAnimalMovementSchema), createAnimalMovement);
router.get("/", authenticate, authorizePermission([Permission.READ_MOVEMENT]), getAllAnimalMovements);
router.get("/:id", authenticate, authorizePermission([Permission.READ_MOVEMENT]), getAnimalMovementById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_MOVEMENT]), validator(updateAnimalMovementSchema), updateAnimalMovement);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_MOVEMENT]), deleteAnimalMovement);

export default router;

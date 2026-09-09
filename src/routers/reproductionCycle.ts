import {
  createReproductionCycle,
  getReproductionCycleById,
  getReproductionCycleStats,
  updateReproductionCycle,
  deleteReproductionCycle,
  listReproductionCycles,
} from "../controllers/reproductionCycle.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { Router } from "express";
import { validator } from "../middlewares/validator.middleware.js";
import {
  createCycleSchema,
  updateCycleSchema,
} from "../validations/reproductionVlidation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_REPRODUCTION_CYCLE]),
  validator(createCycleSchema),
  createReproductionCycle,
);
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_REPRODUCTION_CYCLE]),
  listReproductionCycles
);
router.get(
  "/stats",
  authenticate,
  authorizePermission([Permission.READ_REPRODUCTION_CYCLE]),
  getReproductionCycleStats,
);
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_REPRODUCTION_CYCLE]),
  getReproductionCycleById,
);

router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_REPRODUCTION_CYCLE]),
  validator(updateCycleSchema),
  updateReproductionCycle,
);
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_REPRODUCTION_CYCLE]),
  deleteReproductionCycle,
);

export default router;

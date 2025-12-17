import { Router } from "express";
import {
  createReproductionWithBirth,
  getAllReproductionWithBirth,
} from "../controllers/reproductionBirthController.js";

import { createReproductionWithBirthSchema } from "../validations/reproductionWithBirth.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_REPRODUCTION_WITH_BIRTH]),
  validator(createReproductionWithBirthSchema),
  createReproductionWithBirth
);
router.get("/", authenticate, authorizePermission([Permission.READ_REPRODUCTION_WITH_BIRTH]), getAllReproductionWithBirth);

export default router;

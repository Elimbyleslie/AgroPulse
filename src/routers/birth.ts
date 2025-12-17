import { Router } from "express";
import {
  createBirth,
  getAllBirths,
  getBirthById,
  updateBirth,
  deleteBirth,
} from "../controllers/birthController.js";

import {
  createBirthSchema,
  updateBirthSchema,
} from "../validations/birth.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_BIRTH]), validator(createBirthSchema), createBirth);
router.get("/", authenticate, authorizePermission([Permission.READ_BIRTH]), getAllBirths);
router.get("/:id", authenticate, authorizePermission([Permission.READ_BIRTH]), getBirthById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_BIRTH]), validator(updateBirthSchema), updateBirth);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_BIRTH]), deleteBirth);
export default router;

import {
  createActivityLog,
  getAllActivityLogs,
  getActivityLogById,
  updateActivityLog,
  deleteActivityLog,
} from "../controllers/ActivityLogController.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { validator } from "../middlewares/validator.middleware.js";
import { Router } from "express";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.MANAGE_USERS]),
  createActivityLog,
);
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.MANAGE_USERS]),
  getAllActivityLogs,
);
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.MANAGE_USERS]),
  getActivityLogById,
);
router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.MANAGE_USERS]),
  updateActivityLog,
);
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.MANAGE_USERS]),
  deleteActivityLog,
);

export default router;
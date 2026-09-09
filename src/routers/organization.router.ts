import express from "express";
import {
  createOrganization,
  getAllMyOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getAllOrganizationsForSuperAdmin
} from "../controllers/organizationController.js";
import { createOrganizationSchema } from "../validations/ogarnization.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = express.Router();

router.post(
  "/",
  validator(createOrganizationSchema),
  createOrganization,
);
router.get(
  "/",
  getAllMyOrganizations,
);
router.get(
  "/:id",
  authorizePermission([Permission.READ_ORGANIZATION]),
  getOrganizationById,
);
router.put(
  "/:id",
  authorizePermission([Permission.UPDATE_ORGANIZATION]),
  updateOrganization,
);
router.delete(
  "/:id",
  authorizePermission([Permission.DELETE_ORGANIZATION]),
  deleteOrganization,
);
router.get(
  "/all",authorizePermission([Permission.READ_ORGANIZATION]),
  getAllOrganizationsForSuperAdmin
)

export default router;

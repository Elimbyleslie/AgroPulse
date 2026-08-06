import {
    listGestations,
    getGestationById,
    createGestation,
    updateGestation,
    deleteGestation,
  } from "../controllers/gestationController.js";
import { Router} from "express";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { validator } from "../middlewares/validator.middleware.js";
import { createGestationSchema, updateGestationSchema } from "../validations/reproductionVlidation.js";

const router = Router();

router.post(
  "/",
  authenticate,
    authorizePermission([Permission.CREATE_GESTATION]),
    validator(createGestationSchema),
    createGestation
);
router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_GESTATION]),
  listGestations
);
router.get(
  "/:id",
  authenticate,
    authorizePermission([Permission.READ_GESTATION]),
    getGestationById
);
router.put(
  "/:id",
  authenticate,
    authorizePermission([Permission.UPDATE_GESTATION]),
    validator(updateGestationSchema),
    updateGestation
);
router.delete(
  "/:id",
  authenticate,
    authorizePermission([Permission.DELETE_GESTATION]),
    deleteGestation
);

export default router;
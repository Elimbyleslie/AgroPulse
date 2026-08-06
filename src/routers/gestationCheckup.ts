import {
    createGestationCheckup,
    getCheckupById,
    updateGestationCheckup, 
    listGestationCheckups,
    deleteGestationCheckup
}from "../controllers/gestationCheckupController.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { Router } from "express";
import { validator } from "../middlewares/validator.middleware.js";
import { createCheckupSchema,updateCheckupSchema  } from "../validations/reproductionVlidation.js";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_GESTATION_CHECKUP]),
  validator(createCheckupSchema),
  createGestationCheckup
);
router.get(
    "/:id",
    authenticate,
    authorizePermission([Permission.READ_GESTATION_CHECKUP]),
    getCheckupById
)
router.get(
    "/",
    authenticate,
    authorizePermission([Permission.READ_GESTATION_CHECKUP]),
    listGestationCheckups
);
router.put(
    "/:id",
    authenticate,   
    authorizePermission([Permission.UPDATE_GESTATION_CHECKUP]),
    validator(updateCheckupSchema),
    updateGestationCheckup
);
router.delete(
    "/:id",
    authenticate,   
    authorizePermission([Permission.DELETE_GESTATION_CHECKUP]),
    deleteGestationCheckup
);
export default router;
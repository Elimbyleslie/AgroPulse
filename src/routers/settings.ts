import { settingsValidationSchema, settingsUpdateValidationSchema} from "../validations/settings.js";
import {getSettings, upsertSettings, updateSettings,deleteSettings } from "../controllers/settingsControllers.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { Router } from "express";


const router = Router();

router.get(
    "/",
    authenticate,
    authorizePermission([Permission.READ_SETTINGS]),
    getSettings,
);
router.post(
    "/",
    authenticate,
    authorizePermission([Permission.CREATE_SETTINGS]),
    validator(settingsValidationSchema),
    upsertSettings,
);
router.put(
    "/:id",
    authenticate,
    authorizePermission([Permission.UPDATE_SETTINGS]),
    validator(settingsUpdateValidationSchema),
    updateSettings,
);
router.delete(
    "/:id",
    authenticate,
    authorizePermission([Permission.DELETE_SETTINGS]),
    deleteSettings,
);

export default router;
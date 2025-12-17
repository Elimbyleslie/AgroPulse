import {
    createAlert,
    deleteAlert,
    getAllAlerts,
    getAlertById,
    updateAlert
} from '../controllers/AlertController.js';
import { Router } from 'express';
import { createAlertSchema, updateAlertSchema } from '../validations/alert.js';
import { validator } from '../middlewares/validator.middleware.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';
const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_ALERT]), validator(createAlertSchema), createAlert);
router.get("/", authenticate, authorizePermission([Permission.READ_ALERT]), getAllAlerts);
router.get("/:id", authenticate, authorizePermission([Permission.READ_ALERT]), getAlertById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_ALERT]), validator(updateAlertSchema), updateAlert);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_ALERT]), deleteAlert);

export default router;


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

const router = Router();

router.post("/", validator(createAlertSchema), createAlert);
router.get("/", getAllAlerts);
router.get("/:id", getAlertById);
router.put("/:id", validator(updateAlertSchema), updateAlert);
router.delete("/:id", deleteAlert);
export default router;


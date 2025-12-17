import {
    createReport,
    getAllReports,
    getReportById,
    updateReport,
    deleteReport,
} from '../controllers/reportController.js';
import { createReportSchema, updateReportSchema } from '../validations/report.js';
import { validator } from '../middlewares/validator.middleware.js';
import { Router } from 'express';
import {authenticate, authorizePermission} from "../middlewares/auth.js";
import { Permission } from '../helpers/permissions.js';

const router = Router();
router.post("/", authenticate, authorizePermission([Permission.CREATE_REPORT]), validator(createReportSchema), createReport);
router.get("/", authenticate, authorizePermission([Permission.READ_REPORT]), getAllReports);
router.get("/:id", authenticate, authorizePermission([Permission.READ_REPORT]), getReportById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_REPORT]), validator(updateReportSchema), updateReport);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_REPORT]), deleteReport);

export default router;
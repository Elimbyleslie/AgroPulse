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

const router = Router();
router.post("/", validator(createReportSchema), createReport);
router.get("/", getAllReports);
router.get("/:id", getReportById);
router.put("/:id", validator(updateReportSchema), updateReport);
router.delete("/:id", deleteReport);

export default router;
import { Router } from "express";
import {
  createFinancialReport,
  getAllFinancialReports,
  getFinancialReportById,
  updateFinancialReport,
  deleteFinancialReport,
} from "../controllers/financialReportController.js";

import {
  createFinancialReportSchema,
  updateFinancialReportSchema,
} from "../validations/financialReport.js";

import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createFinancialReportSchema), createFinancialReport);
router.get("/", getAllFinancialReports);
router.get("/:id", getFinancialReportById);
router.put( "/:id",validator(updateFinancialReportSchema),updateFinancialReport);
router.delete("/:id", deleteFinancialReport);

export default router;

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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_FINANCIAL_REPORT]), validator(createFinancialReportSchema), createFinancialReport);
router.get("/", authenticate, authorizePermission([Permission.READ_FINANCIAL_REPORT]), getAllFinancialReports);
router.get("/:id", authenticate, authorizePermission([Permission.READ_FINANCIAL_REPORT]), getFinancialReportById);
router.put( "/:id",authenticate, authorizePermission([Permission.UPDATE_FINANCIAL_REPORT]), validator(updateFinancialReportSchema), updateFinancialReport);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_FINANCIAL_REPORT]), deleteFinancialReport);

export default router;

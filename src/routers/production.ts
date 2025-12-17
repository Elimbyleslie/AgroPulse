import { Router } from "express";
import {
  createProduction,
  getAllProductions,
  getProductionById,
  updateProduction,
  deleteProduction,
} from "../controllers/productionController.js";

import { createProductionSchema, updateProductionSchema } from "../validations/production.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_PRODUCTION]), validator(createProductionSchema), createProduction);
router.get("/", authenticate, authorizePermission([Permission.READ_PRODUCTION]), getAllProductions);
router.get("/:id", authenticate, authorizePermission([Permission.READ_PRODUCTION]), getProductionById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_PRODUCTION]), validator(updateProductionSchema), updateProduction);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_PRODUCTION]), deleteProduction);
export default router;

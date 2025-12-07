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

const router = Router();

router.post("/", validator(createProductionSchema), createProduction);
router.get("/", getAllProductions);
router.get("/:id", getProductionById);
router.put("/:id", validator(updateProductionSchema), updateProduction);
router.delete("/:id", deleteProduction);

export default router;

import { Router } from "express";
import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
} from "../controllers/purchaseController.js";

import {
  createPurchaseSchema,
  updatePurchaseSchema,
} from "../validations/purchase.js";

import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", validator(createPurchaseSchema), createPurchase);
router.get("/", getAllPurchases);
router.get("/:id", getPurchaseById);
router.put("/:id", validator(updatePurchaseSchema), updatePurchase);
router.delete("/:id", deletePurchase);

export default router;

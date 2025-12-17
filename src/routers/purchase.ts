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
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";
import { validator } from "../middlewares/validator.middleware.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_PURCHASE]), validator(createPurchaseSchema), createPurchase);
router.get("/", authenticate, authorizePermission([Permission.READ_PURCHASE]), getAllPurchases);
router.get("/:id", authenticate, authorizePermission([Permission.READ_PURCHASE]), getPurchaseById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_PURCHASE]), validator(updatePurchaseSchema), updatePurchase);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_PURCHASE]), deletePurchase);

export default router;

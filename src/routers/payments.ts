import { Router } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
} from "../controllers/paymentController.js";

import { createPaymentSchema, updatePaymentSchema } from "../validations/payments.js";
import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.post("/", authenticate, authorizePermission([Permission.CREATE_PAYMENT]), validator(createPaymentSchema), createPayment);
router.get("/", authenticate, authorizePermission([Permission.READ_PAYMENT]), getAllPayments);
router.get("/:id", authenticate, authorizePermission([Permission.READ_PAYMENT]), getPaymentById);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_PAYMENT]), validator(updatePaymentSchema), updatePayment);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_PAYMENT]), deletePayment);

export default router;

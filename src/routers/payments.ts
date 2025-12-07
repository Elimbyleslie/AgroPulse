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

const router = Router();

router.post("/", validator(createPaymentSchema), createPayment);
router.get("/", getAllPayments);
router.get("/:id", getPaymentById);
router.put("/:id", validator(updatePaymentSchema), updatePayment);
router.delete("/:id", deletePayment);

export default router;

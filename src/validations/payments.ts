import * as Yup from "yup";
import { PaymentMethod, PaymentStatus } from "../typages/payment.js";




export const createPaymentSchema = Yup.object({
  farmId: Yup.number().required(),
  saleId: Yup.number().optional(),
  purchaseId: Yup.number().optional(),
  expenseId: Yup.number().optional(),
  amount: Yup.number().required(),
  currency: Yup.string().required(),
  method: Yup.mixed<PaymentMethod>().oneOf(Object.values(PaymentMethod)).required(),
  status: Yup.mixed<PaymentStatus>().oneOf(Object.values(PaymentStatus)).required(),
  reference: Yup.string().optional(),
  notes: Yup.string().optional(),
  paidAt: Yup.string().optional(),
  recordedById: Yup.number().optional(),
});

export const updatePaymentSchema = Yup.object({
  farmId: Yup.number().optional(),
  saleId: Yup.number().optional(),
  purchaseId: Yup.number().optional(),
  expenseId: Yup.number().optional(),
  amount: Yup.number().optional(),
  currency: Yup.string().optional(),
  method: Yup.mixed<PaymentMethod>().oneOf(Object.values(PaymentMethod)).optional(),
  status: Yup.mixed<PaymentStatus>().oneOf(Object.values(PaymentStatus)).optional(),
  reference: Yup.string().optional(),
  notes: Yup.string().optional(),
  paidAt: Yup.string().optional(),
  recordedById: Yup.number().optional(),
});


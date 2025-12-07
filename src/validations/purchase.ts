import * as Yup from "yup";

export const createPurchaseSchema = Yup.object().shape({
  supplierId: Yup.number().optional(),
  farmId: Yup.number().required("farmId est obligatoire"),
  totalAmount: Yup.number().optional(),
  purchaseDate: Yup.date().optional(),
  invoiceRef: Yup.string().optional(),
});

export const updatePurchaseSchema = Yup.object().shape({
  supplierId: Yup.number().optional(),
  farmId: Yup.number().optional(),
  totalAmount: Yup.number().optional(),
  purchaseDate: Yup.date().optional(),
  invoiceRef: Yup.string().optional(),
});

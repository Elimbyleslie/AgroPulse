import * as Yup from "yup";

export const createPaymentSchema = Yup.object().shape({
  amount: Yup.number().required("Le montant est obligatoire").positive(),
  currency: Yup.string().default("XAF"),
  method: Yup.string()
    .oneOf(["card", "mobile_money", "orange_money", "paypal", "others"])
    .required("La méthode de paiement est obligatoire"),
  status: Yup.string().oneOf(["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"])
    .default("PENDING"),
  reference: Yup.string().required("La référence est obligatoire"),
  description: Yup.string().optional(),
  userId: Yup.number().optional(),
  saleId: Yup.number().optional(),
});

export const updatePaymentSchema = Yup.object().shape({
  amount: Yup.number().optional(),
  currency: Yup.string().optional(),
  method: Yup.string().oneOf(["card", "mobile_money", "orange_money", "paypal", "others"]).optional(),
  status: Yup.string().oneOf(["PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"]).optional(),
  reference: Yup.string().optional(),
  description: Yup.string().optional(),
  userId: Yup.number().optional(),
  saleId: Yup.number().optional(),
});

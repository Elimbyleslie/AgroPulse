import * as yup from "yup";

export const createFeedSupplierSchema = yup.object({
  name: yup.string().required("Le nom du fournisseur est obligatoire"),
  email: yup.string().email("Email invalide").nullable(),
  phone: yup.string().nullable(),
  category: yup
    .string()
    .oneOf(["FEED", "MEDICAL", "EQUIPMENT", "SERVICE", "OTHER"], "Catégorie invalide")
    .required("La catégorie est obligatoire"),
    farmId: yup.number().required("farmId est obligatoire").typeError("farmId doit être un nombre"),
});

export const updateFeedSupplierSchema = yup.object({
  name: yup.string().nullable(),
  email: yup.string().email("Email invalide").nullable(),
  phone: yup.string().nullable(),
  category: yup
    .string()
    .oneOf(["FEED", "MEDICAL", "EQUIPMENT", "SERVICE", "OTHER"], "Catégorie invalide")
    .nullable(),
});

export const createFeedPurchaseSchema = yup.object({
  supplierId: yup
    .number()
    .required()
    .typeError("supplierId doit être un nombre"),
  farmId: yup.number().required().typeError("farmId doit être un nombre"),
  itemName: yup.string().required("Le nom de l'aliment est obligatoire"),
  quantity: yup.number().required().min(0),
  unitPrice: yup.number().nullable().min(0),
  totalAmount: yup.number().required().min(0),
});

export const updateFeedPurchaseSchema = yup.object({
  supplierId: yup.number().nullable(),
  farmId: yup.number().nullable(),
  itemName: yup.string().nullable(),
  quantity: yup.number().nullable(),
  unitPrice: yup.number().nullable(),
  totalAmount: yup.number().nullable(),
});

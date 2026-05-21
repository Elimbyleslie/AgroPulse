// validators/production.validator.ts
import * as yup from "yup";
import { ProductCategory } from "../../generated/prisma/enums.js";

export const createProductionSchema = yup.object({
  farmId: yup.number().integer().positive().required("farmId est requis"),
  lotId: yup.number().integer().positive().nullable(),
  animalId: yup.number().integer().positive().nullable(),
  herdId: yup.number().integer().positive().nullable(),
  penId: yup.number().integer().positive().nullable(),

  date: yup.date().nullable(),

  Category: yup.mixed<ProductCategory>()
    .oneOf(Object.values(ProductCategory), "Category invalide")
    .required(),

  Type: yup.string().trim().min(2, "Le type doit faire au moins 2 caractères").required(),
  quantity: yup.number().positive("La quantité doit être positive").required(),
  unit: yup.string().trim().min(1).required("L'unité est requise"),

  qualityGrade: yup.string().oneOf(["A", "B", "C"]).nullable(),
  notes: yup.string().trim().max(500).nullable(),
  userId: yup.number().integer().positive().nullable(),
  saleItemId: yup.number().integer().positive().nullable(),
});

export const updateProductionSchema = createProductionSchema.shape({
  farmId: yup.number().integer().positive().optional(),
  Category: yup.mixed<ProductCategory>().oneOf(Object.values(ProductCategory)).optional(),
  Type: yup.string().trim().min(2).optional(),
  quantity: yup.number().positive().optional(),
  unit: yup.string().trim().min(1).optional(),
}).noUnknown(true); // Bloque les champs inconnus
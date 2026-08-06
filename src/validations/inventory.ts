import * as yup from "yup";
import { InventoryCategory, StockStatus } from "../typages/inventory.js"; // Ajuste le chemin

// ====================== CREATE ======================
export const createInventorySchema = yup.object({
  farmId: yup
    .number()
    .integer("farmId doit être un entier")
    .positive("farmId doit être positif")
    .required("farmId est obligatoire"),

  name: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150, "Le nom est trop long (max 150 caractères)")
    .required("Le nom de l'article est obligatoire"),

  category: yup
    .mixed<InventoryCategory>()
    .oneOf(Object.values(InventoryCategory), "Catégorie invalide")
    .required("La catégorie est obligatoire"),

  quantity: yup
    .number()
    .min(0, "La quantité ne peut pas être négative")
    .required("La quantité est obligatoire")
    .default(0),

  unit: yup
    .string()
    .min(1, "L'unité est obligatoire")
    .max(20, "Unité trop longue")
    .required("L'unité de mesure est obligatoire"),

  minQuantity: yup
    .number()
    .min(0, "La quantité minimale ne peut pas être négative")
    .nullable()
    .default(0),

  unitPrice: yup
    .number()
    .min(0, "Le prix unitaire ne peut pas être négatif")
    .nullable(),

  expiryDate: yup
    .date()
    .nullable()
    .min(new Date(), "La date de péremption ne peut pas être dans le passé")
    .transform((curr, orig) => (orig === "" ? null : curr)),

  location: yup
    .string()
    .max(100, "L'emplacement est trop long")
    .nullable(),

  supplierId: yup
    .number()
    .integer()
    .positive()
    .nullable(),

  sku: yup
    .string()
    .max(50, "Le SKU est trop long")
    .nullable(),

  status: yup
    .mixed<StockStatus>()
    .oneOf(Object.values(StockStatus), "Statut invalide")
    .default(StockStatus.IN_STOCK),
});

// ====================== UPDATE ======================
export const updateInventorySchema = yup.object({
  farmId: yup
    .number()
    .integer()
    .positive()
    .optional(),

  name: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150, "Le nom est trop long")
    .optional(),

  category: yup
    .mixed<InventoryCategory>()
    .oneOf(Object.values(InventoryCategory), "Catégorie invalide")
    .optional(),

  quantity: yup
    .number()
    .min(0, "La quantité ne peut pas être négative")
    .optional(),

  unit: yup
    .string()
    .min(1)
    .max(20)
    .optional(),

  minQuantity: yup
    .number()
    .min(0)
    .nullable()
    .optional(),

  unitPrice: yup
    .number()
    .min(0)
    .nullable()
    .optional(),

  expiryDate: yup
    .date()
    .nullable()
    .optional(),

  location: yup
    .string()
    .max(100)
    .nullable()
    .optional(),

  supplierId: yup
    .number()
    .integer()
    .positive()
    .nullable()
    .optional(),

  sku: yup
    .string()
    .max(50)
    .nullable()
    .optional(),

  status: yup
    .mixed<StockStatus>()
    .oneOf(Object.values(StockStatus))
    .optional(),
});
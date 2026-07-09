import * as yup from "yup";
import { FeedCategory,  } from "../typages/feedStock.js";
// ── Schéma de base ────────────────────────────────────────────────────────────
const feedStockBaseSchema = yup.object({
  name: yup
    .string()
    .required("Le nom est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .trim(),

  quantity: yup
    .number()
    .required("La quantité est requise")
    .min(0, "La quantité ne peut pas être négative")
    .typeError("La quantité doit être un nombre"),

  unit: yup
    .string()
    .required("L'unité est requise")
    .oneOf(
      ["kg", "g", "L", "ml", "sac", "tonne", "piece"],
      "Unité invalide : kg, g, L, ml, sac, tonne ou piece",
    ),

  farmId: yup
    .number()
    .required("farmId est requis")
    .integer("farmId doit être un entier")
    .positive("farmId doit être positif")
    .typeError("farmId doit être un nombre"),

  notes: yup
    .string()
    .max(500, "Les notes ne peuvent pas dépasser 500 caractères")
    .trim()
    .nullable()
    .optional(),

  minQuantity: yup
    .number()
    .min(0, "Le seuil minimum ne peut pas être négatif")
    .nullable()
    .optional()
    .typeError("minQuantity doit être un nombre"),
  unitPrice: yup
    .number()
    .min(0, "Le prix unitaire ne peut pas être négatif")
    .nullable()
    .optional()
    .typeError("unitPrice doit être un nombre"),
    totalValue: yup
    .number()
    .min(0, "La valeur totale ne peut pas être négative")
    .nullable()
    .optional()
    .typeError("totalValue doit être un nombre"),
    //validation avec  enum FeedCategory
  category: yup
    .string()
    .oneOf(Object.values(FeedCategory) as string[], "Catégorie invalide")
    .nullable()
    .optional(),
  expiryDate: yup
    .date()
    .nullable()
    .optional()
    .typeError("expiryDate doit être une date"),

    
});

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createFeedStockSchema = feedStockBaseSchema;

// ── UPDATE — farmId non modifiable, tout optionnel ────────────────────────────
export const updateFeedStockSchema = feedStockBaseSchema
  .omit(["farmId"])
  .shape({
    name:        yup.string().min(2).max(100).trim().optional(),
    quantity:    yup.number().min(0).optional().typeError("La quantité doit être un nombre"),
    unit:        yup.string().oneOf(["kg", "g", "L", "ml", "sac", "tonne", "piece"]).optional(),
    notes:       yup.string().max(500).trim().nullable().optional(),
    minQuantity: yup.number().min(0).nullable().optional().typeError("minQuantity doit être un nombre"),
    unitPrice:   yup.number().min(0).nullable().optional().typeError("unitPrice doit être un nombre"),
    totalValue:  yup.number().min(0).nullable().optional().typeError("totalValue doit être un nombre"),
    category:    yup.string().oneOf(Object.values(FeedCategory) as string[]).nullable().optional(),
    expiryDate:  yup.date().nullable().optional().typeError("expiryDate doit être une date"),
  });   
 

// ── QUERY PARAMS ──────────────────────────────────────────────────────────────
export const feedStockQuerySchema = yup.object({
  farmId: yup
    .number()
    .integer("farmId doit être un entier")
    .positive("farmId doit être positif")
    .transform((v) => (isNaN(v) ? undefined : v))
    .optional(),

  page: yup
    .number()
    .integer()
    .positive("La page doit être un entier positif")
    .transform((v) => (isNaN(v) ? 1 : v))
    .default(1),

  limit: yup
    .number()
    .integer()
    .positive()
    .max(100, "La limite ne peut pas dépasser 100")
    .transform((v) => (isNaN(v) ? 10 : v))
    .default(10),
});

// ── PARAM :id ─────────────────────────────────────────────────────────────────
export const feedStockIdSchema = yup.object({
  id: yup
    .number()
    .required("L'id est requis")
    .integer("L'id doit être un entier")
    .positive("L'id doit être positif")
    .typeError("L'id doit être un nombre")
    .transform((v) => (isNaN(v) ? undefined : v)),
});

// ── Types inférés ─────────────────────────────────────────────────────────────
export type CreateFeedStockDto = yup.InferType<typeof createFeedStockSchema>;
export type UpdateFeedStockDto = yup.InferType<typeof updateFeedStockSchema>;
export type FeedStockQuery     = yup.InferType<typeof feedStockQuerySchema>;
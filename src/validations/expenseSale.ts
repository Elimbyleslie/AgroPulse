import * as Yup from "yup";
import { ExpenseCategory, PaymentMethod ,ProductCategory} from "../typages/expenseSale.js";

export const createExpenseSchema = Yup.object().shape({
  farmId: Yup.number()
    .required("L'identifiant de la ferme est obligatoire")
    .positive("farmId invalide"),

  category: Yup.mixed<ExpenseCategory>()
    .oneOf(Object.values(ExpenseCategory), "Catégorie invalide")
    .required("La catégorie est obligatoire"),

  amount: Yup.number()
    .required("Le montant est obligatoire")
    .positive("Le montant doit être positif"),

  taxAmount: Yup.number()
    .min(0, "La TVA ne peut pas être négative")
    .nullable()
    .optional()
    .default(0),

  totalAmount: Yup.number()
    .positive("Le total doit être positif")
    .optional(), // Sera calculé côté backend ou frontend

  date: Yup.date()
    .required("La date est obligatoire")
    .max(new Date(), "La date ne peut pas être dans le futur"), // Optionnel selon tes règles

  paymentMethod: Yup.mixed<PaymentMethod>()
    .oneOf(Object.values(PaymentMethod), "Méthode de paiement invalide")
    .default(PaymentMethod.cash),

  invoiceNumber: Yup.string()
    .trim()
    .max(50, "Le numéro de facture est trop long")
    .nullable()
    .optional(),

  notes: Yup.string()
    .trim()
    .max(500, "Les notes sont trop longues")
    .nullable()
    .optional(),

  isRecurring: Yup.boolean().default(false),

  supplierId: Yup.number()
    .positive()
    .nullable()
    .optional(),
});

export const updateExpenseSchema = createExpenseSchema.shape({
  farmId: Yup.number().optional(),
  category: Yup.mixed<ExpenseCategory>().oneOf(Object.values(ExpenseCategory)).optional(),
  amount: Yup.number().positive().optional(),
  date: Yup.date().optional(),
  // Les autres champs restent optionnels
});

export const createExpenseCategorySchema = Yup.object().shape({
  name: Yup.string()
    .required("Le nom de la catégorie est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
});

export const updateExpenseCategorySchema = createExpenseCategorySchema.shape({
  name: Yup.string().min(2).max(100).optional(),
});


export const SaleStatus = ["PENDING", "COMPLETED", "CANCELLED"] as const;

export const createSaleSchema = Yup.object().shape({
  farmId: Yup.number()
    .required("L'identifiant de la ferme est obligatoire")
    .positive("farmId invalide"),

  date: Yup.date()
    .required("La date est obligatoire")
    .max(new Date(), "La date ne peut pas être dans le futur"),

  total: Yup.number()
    .positive("Le total doit être positif"),

  clientId: Yup.number()
    .positive("Client invalide")
    .nullable()
    .optional(),

  notes: Yup.string()
    .trim()
    .max(500, "Les notes sont trop longues")
    .nullable()
    .optional(),

  status: Yup.mixed<"PENDING" | "COMPLETED" | "CANCELLED">()
    .oneOf(SaleStatus, "Statut invalide")
    .default("COMPLETED"),

  paymentMethod: Yup.mixed<PaymentMethod>()
    .oneOf(Object.values(PaymentMethod), "Méthode de paiement invalide")
    .default(PaymentMethod.cash),
});

export const updateSaleSchema = createSaleSchema.shape({
  farmId: Yup.number().optional(),
  date: Yup.date().optional(),
  total: Yup.number().positive().optional(),
  clientId: Yup.number().positive().nullable().optional(),
  notes: Yup.string().trim().max(500).nullable().optional(),
  status: Yup.mixed<"PENDING" | "COMPLETED" | "CANCELLED">()
    .oneOf(SaleStatus)
    .optional(),
  paymentMethod: Yup.mixed<PaymentMethod>()
    .oneOf(Object.values(PaymentMethod))
    .optional(),
});

//saleItem validation-==============


// ====================== CREATE ======================
export const createSaleItemSchema = Yup.object({
  saleId:   Yup
    .number()
    .integer("saleId doit être un entier")
    .positive("saleId invalide")
    .required("La vente est obligatoire"),

  productName: Yup
    .string()
    .trim()
    .min(1, "Le nom du produit est obligatoire")
    .max(150, "Nom trop long (max 150 caractères)")
    .required("Le nom du produit est obligatoire"),

  category: Yup
    .mixed<ProductCategory>()
    .oneOf(Object.values(ProductCategory), "Catégorie invalide")
    .required("La catégorie est obligatoire"),

  unit: Yup
    .string()
    .trim()
    .min(1, "L'unité est obligatoire")
    .max(30, "Unité trop longue")
    .required("L'unité est obligatoire"),

  quantity: Yup
    .number()
    .typeError("La quantité doit être un nombre")
    .positive("La quantité doit être supérieure à 0")
    .required("La quantité est obligatoire"),

  unitPrice: Yup
    .number()
    .typeError("Le prix unitaire doit être un nombre")
    .min(0, "Le prix unitaire ne peut pas être négatif")
    .required("Le prix unitaire est obligatoire"),

  totalPrice: Yup
    .number()
    .typeError("Le total doit être un nombre")
    .min(0, "Le total ne peut pas être négatif")
    .required("Le total est obligatoire"),

  discount: Yup 
    .number()
    .typeError("La remise doit être un nombre")
    .min(0, "La remise ne peut pas être négative")
    .default(0),

  productionId: Yup
    .number()
    .integer()
    .positive()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    ),

  lotId: Yup
    .number()
    .integer()
    .positive()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    ),

  animalId: Yup
    .number()
    .integer()
    .positive()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : value
    ),

  notes: Yup
    .string()
    .max(500, "Les notes sont trop longues (max 500 caractères)")
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? null : value
    ),
});

// ====================== UPDATE ======================
export const updateSaleItemSchema = Yup.object({
  productName: Yup
    .string()
    .trim()
    .min(1, "Le nom du produit est obligatoire")
    .max(150)
    .optional(),

  category: Yup
    .mixed<ProductCategory>()
    .oneOf(Object.values(ProductCategory), "Catégorie invalide")
    .optional(),

  unit: Yup
    .string()
    .trim()
    .min(1)
    .max(30)
    .optional(),

  quantity: Yup
    .number()
    .typeError("La quantité doit être un nombre")
    .positive("La quantité doit être supérieure à 0")
    .optional(),

  unitPrice: Yup
    .number()
    .typeError("Le prix unitaire doit être un nombre")
    .min(0)
    .optional(),

  totalPrice: Yup
    .number()
    .typeError("Le total doit être un nombre")
    .min(0)
    .optional(),

  discount: Yup
    .number()
    .min(0)
    .optional(),

  productionId: Yup
    .number()
    .integer()
    .positive()
    .nullable()
    .optional(),

  lotId: Yup
    .number()
    .integer()
    .positive()
    .nullable()
    .optional(),

  animalId: Yup
    .number()
    .integer()
    .positive()
    .nullable()
    .optional(),

  notes: Yup
    .string()
    .max(500)
    .nullable()
    .optional(),
});
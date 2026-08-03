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



export const createSaleItemSchema = Yup.object().shape({
  saleId: Yup.number()
    .required("L'identifiant de la vente est obligatoire")
    .positive(),

  productName: Yup.string()
    .required("Le nom du produit est obligatoire")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150, "Le nom est trop long"),

  description: Yup.string()
    .trim()
    .max(500, "La description est trop longue")
    .nullable()
    .optional(),

category: Yup.mixed<ProductCategory>()
  .oneOf(Object.values(ProductCategory), "Catégorie invalide")
  .required("La catégorie est obligatoire"),
  lotId: Yup.number()
    .positive()
    .nullable()
    .optional(),

  animalId: Yup.number()
    .positive()
    .nullable()
    .optional(),

  quantity: Yup.number()
    .required("La quantité est obligatoire")
    .positive("La quantité doit être positive"),

  unitPrice: Yup.number()
    .required("Le prix unitaire est obligatoire")
    .positive("Le prix unitaire doit être positif"),

  totalPrice: Yup.number()
    .required("Le prix total est obligatoire")
    .positive("Le prix total doit être positif"),
});

export const updateSaleItemSchema = createSaleItemSchema.shape({
  saleId: Yup.number().optional(),
  productName: Yup.string().min(2).max(150).optional(),
  description: Yup.string().trim().max(500).nullable().optional(),
  lotId: Yup.number().positive().nullable().optional(),
  animalId: Yup.number().positive().nullable().optional(),
  quantity: Yup.number().positive().optional(),
  unitPrice: Yup.number().positive().optional(),
  totalPrice: Yup.number().positive().optional(),
  category: Yup.mixed<ProductCategory>()
  .oneOf(Object.values(ProductCategory), "Catégorie invalide")
  .optional(),
});
// validations/expense.validation.ts
import * as Yup from "yup";

export const createExpenseSchema = Yup.object().shape({
  farmId: Yup.number().required("farmId obligatoire"),
  categoryId: Yup.number().optional(),
  amount: Yup.number().required("Montant obligatoire"),
  date: Yup.date().required("Date obligatoire"),
  notes: Yup.string().optional(),
});

export const updateExpenseSchema = Yup.object().shape({
  farmId: Yup.number().optional(),
  categoryId: Yup.number().optional(),
  amount: Yup.number().optional(),
  date: Yup.date().optional(),
  notes: Yup.string().optional(),
});

// validations/expenseCategory.validation.ts
export const createExpenseCategorySchema = Yup.object().shape({
  name: Yup.string().required("Nom obligatoire"),
});

export const updateExpenseCategorySchema = Yup.object().shape({
  name: Yup.string().optional(),
});

// validations/sale.validation.ts
export const createSaleSchema = Yup.object().shape({
  farmId: Yup.number().required("farmId obligatoire"),
  date: Yup.date().required("Date obligatoire"),
  total: Yup.number().required("Total obligatoire"),
  notes: Yup.string().optional(),
});

export const updateSaleSchema = Yup.object().shape({
  farmId: Yup.number().optional(),
  date: Yup.date().optional(),
  total: Yup.number().optional(),
  notes: Yup.string().optional(),
});

// validations/saleItem.validation.ts
export const createSaleItemSchema = Yup.object().shape({
  saleId: Yup.number().required("saleId obligatoire"),
  lotId: Yup.number().optional(),
  animalId: Yup.number().optional(),
  quantity: Yup.number().required("Quantité obligatoire"),
  price: Yup.number().required("Prix obligatoire"),
});

export const updateSaleItemSchema = Yup.object().shape({
  saleId: Yup.number().optional(),
  lotId: Yup.number().optional(),
  animalId: Yup.number().optional(),
  quantity: Yup.number().optional(),
  price: Yup.number().optional(),
});

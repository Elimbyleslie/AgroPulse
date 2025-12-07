import * as Yup from "yup";

export const createProductionSchema = Yup.object().shape({
  lotId: Yup.number().optional(),
  date: Yup.date().optional(),
  productType: Yup.string().required("Type de produit obligatoire"),
  quantity: Yup.number().required("Quantité obligatoire"),
  unit: Yup.string().required("Unité obligatoire"),
  qualityGrade: Yup.string().optional(),
  notes: Yup.string().optional(),
  userId: Yup.number().optional(),
  saleItemId: Yup.number().optional(),
});

export const updateProductionSchema = Yup.object().shape({
  lotId: Yup.number().optional(),
  date: Yup.date().optional(),
  productType: Yup.string().optional(),
  quantity: Yup.number().optional(),
  unit: Yup.string().optional(),
  qualityGrade: Yup.string().optional(),
  notes: Yup.string().optional(),
  userId: Yup.number().optional(),
  saleItemId: Yup.number().optional(),
});

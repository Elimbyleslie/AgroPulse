import * as yup from "yup";

export const createFinancialReportSchema = yup.object({
  farmId: yup.number().required("farmId est obligatoire"),
  title: yup.string().required("Le titre est obligatoire"),
  content: yup.string().nullable(),
});

export const updateFinancialReportSchema = yup.object({
  farmId: yup.number().optional(),
  title: yup.string().optional(),
  content: yup.string().nullable().optional(),
});

import yup from "yup";


export const createPlanSchema = yup.object({
  name: yup.string().required().min(2),
  code: yup.string().required().min(2),
  description: yup.string(),
  priceMonthly: yup.number().required(),
  priceYearly: yup.number(),
  currency: yup.string().required(),
  maxFarms: yup.number(),
  maxUsers: yup.number(),
  maxAnimals: yup.number(),
  features: yup.object(),
  isActive: yup.boolean(),
  isPublic: yup.boolean(),
  sortOrder: yup.number(),
});

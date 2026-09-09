import * as yup from "yup";

export const createAnimalWeightSchema = yup.object({
  animalId: yup.number().integer().required(),
  weight: yup.number().required(),
  date: yup.date().required(),
  userId: yup.number().integer().optional(),
});

export const updateAnimalWeightSchema = yup.object({
  animalId: yup.number().integer().optional(),
  weight: yup.number().optional(),
  date: yup.date().optional(),
  userId: yup.number().integer().optional(),
});

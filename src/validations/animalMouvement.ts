import * as yup from "yup";

export const createAnimalMovementSchema = yup.object({
  animalId: yup.number().integer().required(),
  fromPenId: yup.number().integer().optional(),
  toPenId: yup.number().integer().optional(),
  date: yup.date().required(),
});

export const updateAnimalMovementSchema = yup.object({
  animalId: yup.number().integer().optional(),
  fromPenId: yup.number().integer().optional(),
  toPenId: yup.number().integer().optional(),
  date: yup.date().optional(),
});

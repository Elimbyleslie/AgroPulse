import * as yup from "yup";

export const createAnimalDeathSchema = yup.object({
  animalId: yup.number().integer().required(),
  lotId: yup.number().integer().required(),
  dateOfDeath: yup.date().required(),
  cause: yup.string().required(),
  recordedBy: yup.number().integer().required(),
  photo: yup.string().optional(),
});

export const updateAnimalDeathSchema = yup.object({
  animalId: yup.number().integer().optional(),
  lotId: yup.number().integer().optional(),
  dateOfDeath: yup.date().optional(),
  cause: yup.string().optional(),
  recordedBy: yup.number().integer().optional(),
  photo: yup.string().optional(),
});

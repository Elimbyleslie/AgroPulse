import * as yup from "yup";

export const createAnimalTransferSchema = yup.object({
  animalId: yup.number().integer().required(),
  fromLotId: yup.number().integer().optional(),
  toLotId: yup.number().integer().optional(),
  date: yup.date().required(),
  userId: yup.number().integer().optional(),
});

export const updateAnimalTransferSchema = yup.object({
  animalId: yup.number().integer().optional(),
  fromLotId: yup.number().integer().optional(),
  toLotId: yup.number().integer().optional(),
  date: yup.date().optional(),
  userId: yup.number().integer().optional(),
});

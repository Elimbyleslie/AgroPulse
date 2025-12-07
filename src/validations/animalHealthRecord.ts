import * as Yup from "yup";

export const createAnimalHealthRecordSchema = Yup.object().shape({
  animalId: Yup.number().optional(),
  lotId: Yup.number().optional(),
  checkDate: Yup.date().required("Date du contrôle obligatoire"),
  symptoms: Yup.string().optional(),
  diagnosis: Yup.string().optional(),
  treatment: Yup.string().optional(),
  veterinarianId: Yup.number().optional(),
});

export const updateAnimalHealthRecordSchema = Yup.object().shape({
  animalId: Yup.number().optional(),
  lotId: Yup.number().optional(),
  checkDate: Yup.date().optional(),
  symptoms: Yup.string().optional(),
  diagnosis: Yup.string().optional(),
  treatment: Yup.string().optional(),
  veterinarianId: Yup.number().optional(),
});

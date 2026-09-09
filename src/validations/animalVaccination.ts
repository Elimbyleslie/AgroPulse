import * as yup from "yup";

export const createAnimalVaccinationSchema = yup.object().shape({
  animalId: yup.number().nullable().optional(),
  lotId: yup.number().nullable().optional(),
  vaccineName: yup.string().optional(),
  dateGiven: yup.date().nullable().optional(),
  nextDue: yup.date().nullable().optional(),
  administeredBy: yup.number().nullable().optional(),
  inventoryId: yup.number().nullable().optional(),
  quantityUsed: yup.number().nullable().optional(),
  farmId: yup.number().required("farmId est obligatoire"),
});

export const updateAnimalVaccinationSchema = yup.object().shape({
  animalId: yup.number().nullable().optional(),
  lotId: yup.number().nullable().optional(),
  vaccineName: yup.string().optional(),
  dateGiven: yup.date().nullable().optional(),
  nextDue: yup.date().nullable().optional(),
  administeredBy: yup.number().nullable().optional(),
  inventoryId: yup.number().nullable().optional(),
  quantityUsed: yup.number().nullable().optional(),
  farmId: yup.number().nullable().optional(),
});
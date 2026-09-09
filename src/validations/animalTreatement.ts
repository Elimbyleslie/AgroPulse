import * as yup from "yup";

export const createAnimalTreatmentSchema = yup.object().shape({
  animalId: yup.number().nullable().optional(),
  lotId: yup.number().nullable().optional(),

  treatmentName: yup.string().optional(),
  medication: yup.string().optional(),
  dosage: yup.string().optional(),

  startDate: yup.date().nullable().optional(),
  endDate: yup.date().nullable().optional(),

  administeredBy: yup.number().nullable().optional(),
});

export const updateAnimalTreatmentSchema = yup.object().shape({
  animalId: yup.number().nullable().optional(),
  lotId: yup.number().nullable().optional(),

  treatmentName: yup.string().optional(),
  medication: yup.string().optional(),
  dosage: yup.string().optional(),

  startDate: yup.date().nullable().optional(),
  endDate: yup.date().nullable().optional(),

  administeredBy: yup.number().nullable().optional(),
});

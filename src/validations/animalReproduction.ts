import * as Yup from "yup";

export const createAnimalReproductionSchema = Yup.object().shape({
  femaleId: Yup.number().optional(),
  maleId: Yup.number().optional(),
  matingDate: Yup.date().optional(),
  expectedBirth: Yup.date().optional(),
  actualBirthDate: Yup.date().optional(),
  numberBorn: Yup.number().optional(),
  notes: Yup.string().optional(),
});

export const updateAnimalReproductionSchema = Yup.object().shape({
  femaleId: Yup.number().optional(),
  maleId: Yup.number().optional(),
  matingDate: Yup.date().optional(),
  expectedBirth: Yup.date().optional(),
  actualBirthDate: Yup.date().optional(),
  numberBorn: Yup.number().optional(),
  notes: Yup.string().optional(),
});

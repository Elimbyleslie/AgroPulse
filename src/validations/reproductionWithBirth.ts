import * as Yup from "yup";

export const createReproductionWithBirthSchema = Yup.object().shape({
  femaleId: Yup.number().required("femaleId obligatoire"),
  maleId: Yup.number().optional(),
  matingDate: Yup.date().required("Date de saillie obligatoire"),
  expectedBirth: Yup.date().optional(),
  actualBirthDate: Yup.date().optional(),
  numberBorn: Yup.number().optional(),
  notes: Yup.string().optional(),
});

export const updateReproductionWithBirthSchema = Yup.object().shape({
  femaleId: Yup.number().optional(),
  maleId: Yup.number().optional(),
  matingDate: Yup.date().optional(),
  expectedBirth: Yup.date().optional(),
  actualBirthDate: Yup.date().optional(),
  numberBorn: Yup.number().optional(),
  notes: Yup.string().optional(),
});

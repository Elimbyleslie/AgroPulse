import * as Yup from "yup";

export const createBirthSchema = Yup.object().shape({
  farmId: Yup.number().required("farmId est obligatoire"),
  lotId: Yup.number().optional(),
  motherId: Yup.number().required("motherId est obligatoire"),
  fatherId: Yup.number().optional(),
  photo: Yup.string().optional(),
  date: Yup.date().required("La date de naissance est obligatoire"),
  numberBorn: Yup.number().optional(),
  numberAlive: Yup.number().optional(),
  numberDead: Yup.number().optional(),
  notes: Yup.string().optional(),
  userId: Yup.number().optional(),
});

export const updateBirthSchema = Yup.object().shape({
  farmId: Yup.number().optional(),
  lotId: Yup.number().optional(),
  motherId: Yup.number().optional(),
  fatherId: Yup.number().optional(),
  photo: Yup.string().optional(),
  date: Yup.date().optional(),
  numberBorn: Yup.number().optional(),
  numberAlive: Yup.number().optional(),
  numberDead: Yup.number().optional(),
  notes: Yup.string().optional(),
  userId: Yup.number().optional(),
});

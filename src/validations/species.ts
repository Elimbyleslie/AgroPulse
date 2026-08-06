import * as yup from "yup";

export const createSpeciesSchema = yup.object({
  code: yup.string().optional(),
  name: yup.string().required("Le nom de l'espèce est obligatoire"),
});

export const updateSpeciesSchema = yup.object({
  code: yup.string().optional(),
  name: yup.string().optional(),
});

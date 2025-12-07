import * as yup from "yup";

export const createBreedSchema = yup.object().shape({
  speciesId: yup.number().required("speciesId est obligatoire"),
  name: yup.string().required("Nom de la race est obligatoire"),
});

export const updateBreedSchema = yup.object().shape({
  speciesId: yup.number().optional(),
  name: yup.string().optional(),
});

import * as yup from "yup";

export const herdSchema = yup.object({
  farmId: yup.number().required("farmId est obligatoire"),
  speciesId: yup.number().required("speciesId est obligatoire"),
  name: yup.string().required("Le nom du Herd est obligatoire"),
  photo: yup.string().optional(),
});
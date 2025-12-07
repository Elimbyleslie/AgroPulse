import * as Yup from "yup";

export const createAnimalSchema = Yup.object().shape({
  name: Yup.string().required("name est obligatoire"),
  farmId: Yup.number().required("farmId est obligatoire"),
  lotId: Yup.number().optional(),
  speciesId: Yup.number().required("speciesId est obligatoire"),
  breedId: Yup.number().optional(),
  photo: Yup.string().optional(),
  birthId: Yup.number().optional(),
  qrcode: Yup.string().optional(),
  gender: Yup.mixed().oneOf(["male", "female", "unknown"]).optional(),
  birthDate: Yup.date().optional(),
  weight: Yup.number().optional(),
  status: Yup.mixed().oneOf(["active", "sold", "dead", "transferred"]).optional(),
});

export const updateAnimalSchema= Yup.object().shape({
  name: Yup.string().optional(),
  farmId: Yup.number().optional(),
  lotId: Yup.number().optional(),
  speciesId: Yup.number().optional(),
  breedId: Yup.number().optional(),
  photo: Yup.string().optional(),
  birthId: Yup.number().optional(),
  qrcode: Yup.string().optional(),
  gender: Yup.mixed().oneOf(["male", "female", "unknown"]).optional(),
  birthDate: Yup.date().optional(),
  weight: Yup.number().optional(),
  status: Yup.mixed().oneOf(["active", "sold", "dead", "transferred"]).optional(),
});



import * as yup from "yup";
import { LotStatus } from "../../generated/prisma/enums.js";

export const createLotSchema = yup.object({
  herdId: yup.number().optional(),
  farmId: yup.number().required("farmId est obligatoire"),
  barnId: yup.number().optional(),
  name: yup.string().required("Le nom du lot est obligatoire"),
  photo: yup.string().optional(),
  speciesId: yup.number().optional(),
  breedId: yup.number().optional(),
  ageGroup: yup.string().optional(),
  quantity: yup.number().min(0, "La quantité doit être >= 0").default(0),
  entryDate: yup.string()
    .required("La date de naissance est obligatoire")
    .test(
      "valid-date",
      "Format de date invalide",
      (value) => !!value && !isNaN(Date.parse(value)),
    ),
      status: yup
    .mixed<LotStatus>()
    .oneOf(["active", "closed"])
    .default("active"),
});

export const updateLotSchema = yup.object({
  herdId: yup.number().optional(),
  farmId: yup.number(),
  barnId: yup.number().optional(),
  name: yup.string(),
  photo: yup.string().optional(),
  speciesId: yup.number().optional(),
  breedId: yup.number().optional(),
  ageGroup: yup.string().optional(),
  quantity: yup.number().min(0),
  entryDate: yup.string().test(
      "valid-date",
      "Format de date invalide",
      (value) => !!value && !isNaN(Date.parse(value)),
    ),
  status: yup.mixed<LotStatus>().oneOf(["active", "closed"]),
});

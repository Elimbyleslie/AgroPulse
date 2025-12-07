import * as yup from "yup";
import { LotStatus } from "../../generated/prisma/enums.js";

export const createLotSchema = yup.object({
  herdId: yup.number().nullable(),
  farmId: yup.number().required("farmId est obligatoire"),
  barnId: yup.number().nullable(),
  name: yup.string().required("Le nom du lot est obligatoire"),
  photo: yup.string().nullable(),
  speciesId: yup.number().nullable(),
  breedId: yup.number().nullable(),
  ageGroup: yup.string().nullable(),
  quantity: yup.number().min(0, "La quantité doit être >= 0").default(0),
  entryDate: yup.date().nullable(),
  status: yup.mixed<LotStatus>().oneOf(["active","closed","quarantine"]).default("active")
});

export const updateLotSchema = yup.object({
  herdId: yup.number().nullable(),
  farmId: yup.number(),
  barnId: yup.number().nullable(),
  name: yup.string(),
  photo: yup.string().nullable(),
  speciesId: yup.number().nullable(),
  breedId: yup.number().nullable(),
  ageGroup: yup.string().nullable(),
  quantity: yup.number().min(0),
  entryDate: yup.date().nullable(),
  status: yup.mixed<LotStatus>().oneOf(["active","closed","quarantine"])
});

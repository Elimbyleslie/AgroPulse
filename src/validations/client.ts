// validations/clientValidation.ts
import * as yup from "yup";

export const createClientSchema = yup.object({
  farmId: yup
    .number()
    .integer("farmId doit être un nombre entier")
    .positive("farmId doit être positif")
    .required("La ferme est obligatoire"),

  name: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150, "Le nom est trop long (maximum 150 caractères)")
    .required("Le nom du client est obligatoire"),

  email: yup
    .string()
    .email("Adresse email invalide")
    .max(100, "Email trop long")
    .nullable(),

  phone: yup
    .string()
    .max(30, "Numéro de téléphone trop long")
    .nullable(),

  address: yup
    .string()
    .max(300, "L'adresse est trop longue")
    .nullable(),
});

export const updateClientSchema = yup.object({
  name: yup
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150)
    .optional(),

  email: yup
    .string()
    .email("Adresse email invalide")
    .max(100)
    .nullable()
    .optional(),

  phone: yup
    .string()
    .max(30)
    .nullable()
    .optional(),

  address: yup
    .string()
    .max(300)
    .nullable()
    .optional(),
});
import * as yup from "yup";

export const createApiKeySchema = yup.object({
  organizationId: yup
    .number()
    .required("organizationId est obligatoire"),

  key: yup
    .string()
    .required("La clé API est obligatoire"),

  expiresAt: yup
    .date()
    .nullable()
    .typeError("expiresAt doit être une date valide"),
});

export const updateApiKeySchema = yup.object({
  organizationId: yup.number().optional(),
  key: yup.string().optional(),
  expiresAt: yup
    .date()
    .nullable()
    .optional()
    .typeError("expiresAt doit être une date valide"),
});

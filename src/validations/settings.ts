import * as Yup from "yup";

export const settingsValidationSchema = Yup.object().shape({
  // Configuration Générale
  currency: Yup.string()
    .oneOf(["XOF", "EUR", "USD", "CFA"])
    .default("XOF")
    .required("La devise est obligatoire"),

  language: Yup.string()
    .oneOf(["fr", "en"])
    .default("fr")
    .required("La langue est obligatoire"),

  dateFormat: Yup.string()
    .oneOf(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"])
    .default("DD/MM/YYYY"),

  timezone: Yup.string()
    .default("Africa/Dakar"),

  // Unités de Mesure
  weightUnit: Yup.string()
    .oneOf(["kg", "g", "lb"])
    .default("kg"),

  volumeUnit: Yup.string()
    .oneOf(["L", "ml", "cl"])
    .default("L"),

  areaUnit: Yup.string()
    .oneOf(["ha", "m2", "acres"])
    .default("ha"),

  // Paramètres d'Élevage
  defaultSpeciesId: Yup.number().positive().nullable(),
  defaultBreedId: Yup.number().positive().nullable(),

  heatDetectionDays: Yup.number()
    .min(15)
    .max(45)
    .default(21)
    .required("Le nombre de jours de détection de chaleur est obligatoire"),

  gestationDuration: Yup.number()
    .min(100)
    .max(400)
    .default(280)
    .required("La durée de gestation est obligatoire"),

  // Notifications
  enableEmailAlerts: Yup.boolean().default(true),
  enableSmsAlerts: Yup.boolean().default(false),

  lowStockThreshold: Yup.number()
    .min(0)
    .default(10)
    .required("Le seuil d'alerte de stock est obligatoire"),

  // Finance
  taxRate: Yup.number()
    .min(0)
    .max(100)
    .default(0),

  defaultPaymentMethod: Yup.string()
    .oneOf(["cash", "mobile_money", "orange_money", "card", "paypal", "others"])
    .default("cash")
    .required(),

  // Apparence
  primaryColor: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Couleur hexadécimale invalide (ex: #1e40af)")
    .default("#1e40af"),

  logoUrl: Yup.string().url().nullable(),
  farmName: Yup.string().max(100).nullable(),

  // Clés étrangères
  farmId: Yup.number().positive().nullable(),
  organizationId: Yup.number().positive().nullable(),
});

// Version pour mise à jour partielle (plus permissive)
export const settingsUpdateValidationSchema = settingsValidationSchema.shape({
}).noUnknown(true);
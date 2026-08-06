import * as Yup from 'yup';

export const feedingPlanSchema = Yup.object().shape({
  // Identifiants relationnels
  farmId: Yup.number().required("L'ID de la ferme est requis"),
  userId: Yup.number().required("L'ID de l'utilisateur est requis"),

  // Cibles (Validation : au moins un des quatre doit être présent)
  animalId: Yup.number().nullable(),
  lotId: Yup.number().nullable(),
  herdId: Yup.number().nullable(),
  penId: Yup.number().nullable(),

  // Détails de la ration
  quantity: Yup.number()
    .positive("La quantité doit être supérieure à 0")
    .required("La quantité est requise"),
  unit: Yup.string()
    .required("L'unité est requise")
    .oneOf(['kg', 'g', 'l', 'ml', 'sac','botte'], "Unité non valide"), // À adapter selon tes besoins

  frequency: Yup.string()
    .oneOf(['daily', 'weekly', 'custom'], "Fréquence invalide")
    .required("La fréquence est requise"),

  // Dates
  startDate: Yup.date()
    .required("La date de début est requise")
    .typeError("Format de date invalide"),
  endDate: Yup.date()
    .nullable()
    .min(
      Yup.ref('startDate'),
      "La date de fin ne peut pas être antérieure à la date de début"
    ),

  // Informations complémentaires
  notes: Yup.string()
    .max(500, "Les notes ne doivent pas dépasser 500 caractères")
    .nullable(),

}).test(
  'at-least-one-target',
  'Vous devez sélectionner au moins un animal, un lot, un troupeau ou un enclos',
  (value) => {
    return !!(value.animalId || value.lotId || value.herdId || value.penId);
  }
);
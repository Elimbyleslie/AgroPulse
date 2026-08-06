import * as Yup from "yup";

// Force la conversion en nombre de manière sécurisée
const forceNumber = (value: any) => {
  if (value === "" || value === null || value === undefined || value === "null" || value === "undefined") return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? value : parsed;
};

export const createAnimalSchema = Yup.object().shape({
  name: Yup.string().required("Le nom est obligatoire"),
  
  // Utilisation de .lazy() ou d'un transform plus agressif
  farmId: Yup.number()
    .transform(forceNumber) // Prépare la donnée avant toute validation
    .typeError("farmId doit être un nombre")
    .required("farmId est obligatoire"),
    
  speciesId: Yup.number()
    .transform(forceNumber)
    .typeError("speciesId doit être un nombre")
    .required("speciesId est obligatoire"),
    
  breedId: Yup.number()
    .transform(forceNumber)
    .nullable()
    .optional(),
    
  lotId: Yup.number()
    .transform(forceNumber)
    .nullable()
    .optional(),

  weight: Yup.number()
    .transform(forceNumber)
    .typeError("Le poids doit être un nombre")
    .nullable()
    .optional(),

  gender: Yup.mixed()
    .oneOf(["male", "female", "unknown"], "Genre invalide")
    .required("Le genre est obligatoire"),
    
  birthDate: Yup.string()
    .required("La date de naissance est obligatoire")
    .test(
      "valid-date",
      "Format de date invalide",
      (value) => !!value && !isNaN(Date.parse(value)),
    ),

  status: Yup.string()
    .oneOf(["active", "sold", "dead", "transferred"], "Statut invalide")
    .default("active"),
});

// Applique la même logique pour updateAnimalSchema
export const updateAnimalSchema = createAnimalSchema.clone().shape({
  name: Yup.string().optional(),
  farmId: Yup.number().transform(forceNumber).optional(),
  birthDate: Yup.string().optional(),
  // ... garde le reste identique
});
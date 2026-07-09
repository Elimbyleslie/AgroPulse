import * as Yup from "yup";


const forceNumber = (value: any) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? value : parsed;
};

export const createEquipmentSchema = Yup.object().shape({
  farmId: Yup.number()
    .transform(forceNumber)
    .required("La ferme est obligatoire"),

  name: Yup.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(150, "Le nom est trop long")
    .required("Le nom de l'équipement est obligatoire"),

  description: Yup.string().max(500, "La description est trop longue").nullable(),

  purchaseDate: Yup.date()
    .nullable()
    .typeError("Date d'achat invalide"),

  inventoryId: Yup.number()
    .transform(forceNumber)
    .nullable(),

  status: Yup.string()
    .oneOf(
      ["operational", "underMaintenance", "outOfService"],
      "Statut invalide"
    )
    .default("operational"),

  value: Yup.number()
    .transform(forceNumber)
    .min(0, "La valeur ne peut pas être négative")
    .nullable(),

  maintenanceFrequency: Yup.string()
    .oneOf(
      ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"],
      "Fréquence de maintenance invalide"
    )
    .default("monthly"),
});

export const updateEquipmentSchema = createEquipmentSchema.clone().shape({
  name: Yup.string().min(2).max(150).optional(),
  farmId: Yup.number().transform(forceNumber).optional(),
});

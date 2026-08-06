import * as Yup from "yup";


const forceNumber = (value: any) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? value : parsed;
};

export const createEquipmentMaintenanceSchema = Yup.object().shape({
  equipmentId: Yup.number()
    .transform(forceNumber)
    .required("L'équipement est obligatoire"),

  farmId: Yup.number()
    .transform(forceNumber)
    .required("La ferme est obligatoire"),

  name: Yup.string()
    .min(3, "Le nom de la maintenance doit être plus descriptif")
    .max(200)
    .required("Le titre de la maintenance est obligatoire"),

  maintenanceDate: Yup.date()
    .required("La date de maintenance est obligatoire")
    .typeError("Date invalide"),

  cost: Yup.number()
    .transform(forceNumber)
    .min(0, "Le coût ne peut pas être négatif")
    .nullable(),

  notes: Yup.string().max(1000, "Les notes sont trop longues").nullable(),

  userId: Yup.number()
    .transform(forceNumber)
    .nullable(),
});

export const updateEquipmentMaintenanceSchema = createEquipmentMaintenanceSchema.clone().shape({
  name: Yup.string().optional(),
  maintenanceDate: Yup.date().optional(),
  cost: Yup.number().nullable().optional(),
});
import * as Yup from "yup";

const forceNumber = (value: any) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? value : parsed;
};

export const createStockMovementSchema = Yup.object().shape({
  inventoryId: Yup.number()
    .transform(forceNumber)
    .typeError("inventoryId doit être un nombre")
    .required("L'article d'inventaire est obligatoire"),

  type: Yup.string()
    .oneOf(
      ["PURCHASE", "USAGE", "ADJUSTMENT", "TRANSFER", "RETURN", "WASTE"],
      "Type de mouvement invalide"
    )
    .required("Le type de mouvement est obligatoire"),

  quantity: Yup.number()
    .transform(forceNumber)
    .positive("La quantité doit être positive")
    .required("La quantité est obligatoire"),

  reference: Yup.string().optional().nullable(),
  notes: Yup.string().optional().nullable(),
  farmId: Yup.number()
    .transform(forceNumber)
    .required("farmId est obligatoire"),
});

export const updateStockMovementSchema = Yup.object().shape({
  quantity: Yup.number().transform(forceNumber).positive().optional(),
  reference: Yup.string().optional().nullable(),
  notes: Yup.string().optional().nullable(),
});
import * as yup from "yup";

export const createInventorySchema = yup.object({
  farmId: yup.number().required("farmId est obligatoire"),
  name: yup.string().required("Le nom de l'inventaire est obligatoire"),
  date: yup.date().required("La date de l'inventaire est obligatoire"),
quantity: yup.number().min(0, "La quantité doit être >= 0").default(0),
unit: yup.string().nullable(),
notes: yup.string().nullable(),
});

export const updateInventorySchema = yup.object({
  farmId: yup.number(),
  name: yup.string(),
  date: yup.date(),
  items: yup.array().of(
    yup.object({
      itemId: yup.number(),
      quantity: yup.number().min(0, "La quantité doit être >= 0")
    })
  ),
}
  )
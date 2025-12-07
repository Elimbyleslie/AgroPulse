import * as yup from "yup";

export const createFeedUsageSchema = yup.object().shape({
    lodId: yup.number().required("L'ID de la ferme est obligatoire"),
    feedStockId: yup.number().required("L'ID du stock d'aliments est obligatoire"),
    quantity: yup.number().required("La quantité utilisée est obligatoire").min(0, "La quantité utilisée ne peut pas être négative"),
    Date: yup.date().required("La date d'utilisation est obligatoire"),
});

export const updateFeedUsageSchema = yup.object().shape({
    lodId: yup.number().optional(),
    feedStockId: yup.number().optional(),
    quantity: yup.number().optional(),
    Date: yup.date().optional(),
});

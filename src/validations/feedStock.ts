import * as yup from 'yup';

export const createFeedStockSchema = yup.object().shape({
    name: yup.string().required('Le nom est obligatoire'),
    quantity: yup.number().required('La quantité est obligatoire').min(0, 'La quantité ne peut pas être négative'),
    unit: yup.string().required('L\'unité est obligatoire'),
    farmId: yup.number().required('L\'ID de la ferme est obligatoire'),
    notes: yup.string().optional(),
});

export const updateFeedStockSchema = yup.object().shape({
    name: yup.string().optional(),
    quantity: yup.number().optional(),
    unit: yup.string().optional(),
    farmId: yup.number().optional(),
    notes: yup.string().optional(),
});
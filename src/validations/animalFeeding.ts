import * as yup from 'yup';

export const animalFeedingSchema = yup.object().shape({
    animalId: yup.string().required('Animal ID is required'),
    feedStockId: yup.number().required('FeedStockId is required'),
    lotId: yup.number().optional(),
    quantity: yup.number().positive('Quantity must be a positive number').required('Quantity is required'),
   userId: yup.number().required('User ID is required'),
});

export const createAnimalFeedingSchema = animalFeedingSchema;

export const updateAnimalFeedingSchema = yup.object().shape({
    animalId: yup.string().optional(),
    feedStockId: yup.number().optional(),
    lotId: yup.number().optional(),
    quantity: yup.number().positive('Quantity must be a positive number').optional(),
    userId: yup.number().optional(),
});

import yup from 'yup';

export const createPlanSchema = yup.object({
    name: yup.string().required().min(2),
    price: yup.number().required().min(0),
    durationDays: yup.number().required().min(1),
    description: yup.string().required(),
    billingCycle: yup.string().required(),
    userLimit: yup.number().required().min(1),
    storageLimit: yup.number().required().min(1),
    animalLimit: yup.number().required().min(1),
})
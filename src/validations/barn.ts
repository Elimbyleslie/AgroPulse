import yup from 'yup';

export const createBarnSchema = yup.object({
    farmId: yup.string().required(),
    name: yup.string().required().min(2),
    capacity: yup.number().required().min(1),
    photo: yup.string(),
});

export const updateBarnSchema = yup.object({
    farmId: yup.string(),
    name: yup.string().min(2),
    capacity: yup.number().min(1),
    photo: yup.string(),
});

import yup from 'yup';

export const createBarnSchema = yup.object({
    farmId: yup.string().required(),
    name: yup.string().required().min(2),
    capacity: yup.number().required().min(1),
    photo: yup.string(),
});

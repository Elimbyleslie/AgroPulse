import yup from 'yup';

export const createPenSchema = yup.object({
    barnId: yup.number().required(),
    name: yup.string().required().min(2),
    capacity: yup.number().required().min(1),
    photo: yup.string(),
});

export const UpdatePenSchema = yup.object({
    name: yup.string().required().min(2),
    capacity: yup.number().required().min(1),
});

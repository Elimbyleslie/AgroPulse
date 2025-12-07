import yup from 'yup';

export const createFarmSchema = yup.object({
    name: yup.string().required().min(2),
    organizationId: yup.number().required('Veuillez selectionner une organisation.'),
    location: yup.string().required().min(3),
    area: yup.number().required().min(1),
    photo: yup.string(),
    areaUnit: yup.string().required().min(1),
    latitude: yup.number(),
    longitude: yup.number(),
});

export const updateFarmSchema = yup.object({
    name: yup.string().min(2),
    organizationId: yup.number().required('Veuillez selectionner une organisation.'),
    location: yup.string().min(3),
    area: yup.number().min(1),
    photo: yup.string(),
    areaUnit: yup.string().min(1),
    latitude: yup.number(),
    longitude: yup.number(),
});
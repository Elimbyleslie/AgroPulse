import  * as yup from 'yup';

export const subscriptionSchema = yup.object().shape({
    name: yup.string().required("Nom est obligatoire"),
    price: yup.number().required("Prix est obligatoire"),
    duration: yup.number().required("Duree est obligatoire"),
    description: yup.string().required("Description est obligatoire"),
});

export const updateSubscriptionSchema = yup.object().shape({
    name: yup.string(),
    price: yup.number(),
    duration: yup.number(),
    description: yup.string(),
});
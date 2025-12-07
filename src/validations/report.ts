import  * as yup from 'yup';

export const createReportSchema = yup.object({
    farmId: yup.number().required('FarmId is required field'),
    title: yup.string().required('Title is required field'),
    content: yup.string().required('Message is required field'),
});

export const updateReportSchema = yup.object({
    farmId: yup.number(),
    title: yup.string(),
    content: yup.string(),
});

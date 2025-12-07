import { assign } from 'nodemailer/lib/shared';
import yup from 'yup';

export const createFarmTaskSchema = yup.object({
    farmId: yup.number().required('Farm ID is required'),
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    assignedTo: yup.number().required('Assigned To is required'),
    dueDate: yup.date().required('Due date is required'),
    status: yup.string().oneOf(['pending', 'in_progress', 'completed']).required('Status is required'),

});

export const updateFarmTaskSchema = yup.object({
    farmId: yup.number().optional(),
    title: yup.string().optional(),
    description: yup.string().optional(),
    assignedTo: yup.number().optional(),
    dueDate: yup.date().optional(),
    status: yup.string().oneOf(['pending', 'in_progress', 'completed']).optional(),
});
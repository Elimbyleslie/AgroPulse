import * as yup from 'yup';

export const createEquipementSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    farmId: yup.number().required('Farm ID is required'),
    value: yup.number().min(0, 'Cost must be a positive number').required('Cost is required'),
    description: yup.string().optional(),
    purchaseDate: yup.date().required('Purchase date is required'),
    status: yup.string().oneOf(['operational', 'under_maintenance', 'out_of_order']).required('Status is required'),
    maintenanceDate: yup.date().optional(),
});

export const updateEquipementSchema = yup.object().shape({
    name: yup.string().optional(),
    farmId: yup.number().optional(),
    value: yup.number().min(0, 'Cost must be a positive number').optional(),
    description: yup.string().optional(),
    purchaseDate: yup.date().optional(),
    status: yup.string().oneOf(['operational', 'under_maintenance', 'out_of_order']).optional(),
    maintenanceDate: yup.date().optional(),
});
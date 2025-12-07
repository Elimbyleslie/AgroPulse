import * as yup from 'yup';

export const createEquipmentMaintenanceSchema = yup.object().shape({
    equipmentId: yup.string().required('Equipment ID is required'),
    farmId: yup.number().required('Farm ID is required'),
    name: yup.string().required('Name is required'),
    maintenanceDate: yup.date().required('Maintenance date is required'),
    userId: yup.number().required('UserId by is required'),
    notes: yup.string().optional(),
    cost: yup.number().min(0, 'Cost must be a positive number').required('Cost is required'),
});
export const updateEquipmentMaintenanceSchema = yup.object().shape({
    equipmentId: yup.string().optional(),
    farmId: yup.number().optional(),
    name: yup.string().optional(),
    maintenanceDate: yup.date().optional(),
    userId: yup.number().optional(),
    notes: yup.string().optional(),
    cost: yup.number().min(0, 'Cost must be a positive number').optional(),
});

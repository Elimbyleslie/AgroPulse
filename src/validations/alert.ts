import * as yup from 'yup';
import {    AlertStatus } from '../../generated/prisma/enums.js';

export const createAlertSchema = yup.object({
    farmId: yup.number().required('Farm ID is required'),
    title: yup.string().required('Title is required'),
    message: yup.string().required('Description is required'),
    date: yup.date().required('Date is required'),
    status: yup.mixed<AlertStatus>().oneOf(Object.values(AlertStatus)).required('Status is required'),
})

export const updateAlertSchema = yup.object({
    farmId: yup.number().optional(),
    title: yup.string().optional(),
    message: yup.string().optional(),
    date: yup.date().optional(),
    status: yup.mixed<AlertStatus>().oneOf(Object.values(AlertStatus)).optional(),
})
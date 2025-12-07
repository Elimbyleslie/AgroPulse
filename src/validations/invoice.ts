import * as Yup from 'yup';


export const createInvoiceSchema = Yup.object({
    organizationId: Yup.number().required('organizationId est obligatoire'),
    subscriptionId: Yup.number().required('subscriptionId est obligatoire'),
    amount: Yup.number().required('Le montant est obligatoire'),
    paymentMethod: Yup.string().required(),
    currency: Yup.string().required('La devise est obligatoire'),
    issuedAt: Yup.date().required('La date d\'émission est obligatoire'),
    dueAt: Yup.date().required('La date d\'échéance est obligatoire'),
    status: Yup.string().oneOf(['pending', 'paid', 'overdue']).required('Le statut est obligatoire'),

});

export const updateInvoiceSchema = Yup.object({
    amount: Yup.number().optional(),
    paymentMethod: Yup.string().optional(),
    currency: Yup.string().optional(),
    issuedAt: Yup.date().optional(),
    dueAt: Yup.date().optional(),
    status: Yup.string().oneOf(['pending', 'paid', 'overdue']).optional(),
});
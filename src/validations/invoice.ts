import * as Yup from "yup";
import { InvoiceStatus } from '../typages/invoices.js'


export const createInvoiceSchema  = Yup.object({
  organizationId: Yup.number().required(),
  subscriptionId: Yup.number().required(),
  number: Yup.string().required(),
  status: Yup.mixed<InvoiceStatus>().oneOf(Object.values(InvoiceStatus)).required(),
  amount: Yup.number().required(),
  taxAmount: Yup.number().required(),
  totalAmount: Yup.number().required(),
  currency: Yup.string().required(),
  periodStart: Yup.string().required(),
  periodEnd: Yup.string().required(),
  dueDate: Yup.string().required(),
  issuedAt: Yup.string().required(),
  notes: Yup.string().optional(),
  metadata: Yup.object().optional(),
})

export const updateInvoiceSchema = Yup.object({
  organizationId: Yup.number().optional(),
  subscriptionId: Yup.number().optional(),
  number: Yup.string().optional(),
  status: Yup.mixed<InvoiceStatus>().oneOf(Object.values(InvoiceStatus)).optional(),
  amount: Yup.number().optional(),
  taxAmount: Yup.number().optional(),
  totalAmount: Yup.number().optional(),
  currency: Yup.string().optional(),
  periodStart: Yup.string().optional(),
  periodEnd: Yup.string().optional(),
  dueDate: Yup.string().optional(),
  issuedAt: Yup.string().optional(),
  notes: Yup.string().optional(),
  metadata: Yup.object().optional(),
})
  


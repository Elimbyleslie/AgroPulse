import * as Yup  from 'yup';
import {PaymentMethod } from '../typages/payment.js';
import { SubscriptionPaymentStatus } from '../typages/subcriptionPayment.js';



export const createSubscriptionPaymentSchema = Yup.object().shape({
  organizationId: Yup.number().required("organizationId est obligatoire"),
  subscriptionId: Yup.number().optional(),
  invoiceId: Yup.number().optional(),
  amount: Yup.number().required("amount est obligatoire"),
  currency: Yup.string().required("currency est obligatoire"),
  method: Yup.mixed<PaymentMethod>().oneOf(Object.values(PaymentMethod)).required("method est obligatoire"),
  status: Yup.mixed<SubscriptionPaymentStatus>().oneOf(Object.values(SubscriptionPaymentStatus)).required("status est obligatoire"),
  provider: Yup.string().optional(),
  providerRef: Yup.string().optional(),
  notes: Yup.string().optional(),
  metadata: Yup.object().optional(),
})

export const updateSubscriptionPaymentSchema = Yup.object().shape({
  organizationId: Yup.number().optional(),
  subscriptionId: Yup.number().optional(),
  invoiceId: Yup.number().optional(),
  amount: Yup.number().optional(),
  currency: Yup.string().optional(),
  method: Yup.mixed<PaymentMethod>().oneOf(Object.values(PaymentMethod)).optional(),
  status: Yup.mixed<SubscriptionPaymentStatus>().oneOf(Object.values(SubscriptionPaymentStatus)).optional(),
  provider: Yup.string().optional(),
  providerRef: Yup.string().optional(),
  notes: Yup.string().optional(),
  metadata: Yup.object().optional(),
})
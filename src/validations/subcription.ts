import * as Yup from "yup";


export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PAUSED = "PAUSED",
}

export enum BillingInterval {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export const subscriptionValidationSchema = Yup.object().shape({
  organizationId: Yup.number().required("L'organisation est obligatoire"),
  planId: Yup.number().required("Le plan est obligatoire"),
  billingInterval: Yup.mixed<BillingInterval>()
    .oneOf(Object.values(BillingInterval))
    .optional(), // le contrôleur applique "MONTHLY" par défaut si absent
  trialDays: Yup.number().min(0).optional(),
  method: Yup.string().optional(),
  provider: Yup.string().nullable(),
  providerRef: Yup.string().nullable(),
  notes: Yup.string().nullable(),
  metadata: Yup.object().nullable(),
});


export const subscriptionUpdateValidationSchema = Yup.object().shape({
  planId: Yup.number().optional(),
  billingInterval: Yup.mixed<BillingInterval>()
    .oneOf(Object.values(BillingInterval))
    .optional(),
  cancelAtPeriodEnd: Yup.boolean().optional(),
  notes: Yup.string().nullable(),
  metadata: Yup.object().nullable(),
});
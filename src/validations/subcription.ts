import * as Yup from "yup";
import { SubscriptionStatus, RenewalType } from "../typages/subscription.js"; 

export const subscriptionValidationSchema = Yup.object().shape({
  organizationId: Yup.number()
    .positive("L'ID de l'organisation est obligatoire")
    .required("L'organisation est requise"),

  planId: Yup.number()
    .positive("L'ID du plan est obligatoire")
    .required("Le plan est requis"),

  renewalType: Yup.string()
    .oneOf(
      Object.values(RenewalType),
      "Type de renouvellement invalide"
    )
    .default(RenewalType.MANUAL)
    .required(),

  status: Yup.string()
    .oneOf(
      Object.values(SubscriptionStatus),
      "Statut d'abonnement invalide"
    )
    .default(SubscriptionStatus.ACTIVE)
    .required(),
});

// Schéma pour mise à jour (plus permissif)
export const subscriptionUpdateValidationSchema = Yup.object().shape({
  organizationId: Yup.number().positive(),
  planId: Yup.number().positive(),
  startDate: Yup.date().min(new Date()),
  endDate: Yup.date().min(Yup.ref("startDate")),
  renewalType: Yup.string().oneOf(Object.values(RenewalType)),
  status: Yup.string().oneOf(Object.values(SubscriptionStatus)),
}).noUnknown(true); // Rejette les champs inconnus
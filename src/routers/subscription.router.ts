import { Router } from "express";

import {
  createSubscription,
  getOrganizationSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
} from "../controllers/subcriptionController.js";

import {
  subscriptionValidationSchema,
  subscriptionUpdateValidationSchema,
} from "../validations/subcription.js";

import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

// ========================
// ROUTES ABONNEMENTS
// ========================

// Créer un abonnement
router.post(
  "/",
  authenticate,
  authorizePermission([Permission.CREATE_SUBSCRIPTION]),
  validator(subscriptionValidationSchema),
  createSubscription
);

// Lister les abonnements d'une organisation
router.get(
  "/organization/:organizationId",
  authenticate,
  authorizePermission([Permission.READ_SUBSCRIPTION]),
  getOrganizationSubscriptions
);

// Récupérer un abonnement par ID
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_SUBSCRIPTION]),
  getSubscriptionById
);

// Mettre à jour un abonnement
router.put(
  "/:id",
  authenticate,
  authorizePermission([Permission.UPDATE_SUBSCRIPTION]),
  validator(subscriptionUpdateValidationSchema),
  updateSubscription
);

// Annuler un abonnement
router.post(
  "/:id/cancel",
  authenticate,
  authorizePermission([Permission.UPDATE_SUBSCRIPTION]),
  cancelSubscription
);

// Supprimer un abonnement (optionnel - attention à l'usage)
router.delete(
  "/:id",
  authenticate,
  authorizePermission([Permission.DELETE_SUBSCRIPTION]),
  deleteSubscription
);

export default router;
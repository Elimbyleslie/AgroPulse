// src/controllers/subscriptionController.ts
import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Subscription } from "../typages/subscription.js";
import { SubscriptionStatus } from "../../generated/prisma/enums.js";

// Créer un abonnement
export const createSubscription = async (
  req: Request<{}, {}, Subscription>,
  res: Response
) => {
  try {
    const { organizationId, planId, renewalType } = req.body;

    if (!organizationId || !planId || !renewalType) {
      return ResponseApi.error(res, "Champs requis manquants", 400);
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return ResponseApi.error(res, "Plan introuvable", 404);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        planId,
        startDate,
        endDate,
        renewalType,
        status: SubscriptionStatus.active,
      },
      include: { plan: true },
    });

    return ResponseApi.success(res, "Abonnement créé", 201, subscription);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Lister les abonnements d'une organisation
export const getOrganizationSubscriptions = async (
  req: Request,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    const subscriptions = await prisma.subscription.findMany({
      where: { organizationId: Number(organizationId) },
      include: { plan: true, invoices: true },
      orderBy: { startDate: "desc" },
    });

    return ResponseApi.success(
      res,
      "Liste des abonnements",
      200,
      subscriptions
    );
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Annuler un abonnement
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.update({
      where: { id: Number(id) },
      data: { status: "cancelled" },
    });

    return ResponseApi.success(res, "Abonnement annulé", 200, subscription);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

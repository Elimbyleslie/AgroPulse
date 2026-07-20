// src/controllers/subscriptionController.ts
import { Request, Response,NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Subscription } from "../typages/subscription.js";
import { SubscriptionStatus } from "../../generated/prisma/enums.js";

// Créer un abonnement
export const createSubscription = async (
  req: Request<{}, {}, Subscription>,
  res: Response,
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

// Lister les abonnements d'une organisation avec pagination et search
// ========================
// GET ORGANIZATION SUBSCRIPTIONS
// ========================
export const getOrganizationSubscriptions = async (
  req: Request<
    { organizationId: string },
    {},
    {},
    { page?: string; limit?: string; status?: string; search?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organizationId } = req.params;
    const { page = "1", limit = "10", status, search } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Math.max(1, Number(limit))); // Sécurité : max 50 par page
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      organizationId: Number(organizationId),
    };

    // Filtre par statut
    if (status) {
      where.status = status;
    }

    // Recherche sur le nom du plan (via include)
    if (search) {
      where.plan = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const [subscriptions, totalItems] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { startDate: "desc" },
        include: {
          plan: true,           // Détails du plan
          organization: true,   // Optionnel : infos organisation
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des abonnements récupérée avec succès", 200, {
      subscriptions,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / limitNumber),
        totalItems,
        limit: limitNumber,
        hasNext: pageNumber * limitNumber < totalItems,
        hasPrevious: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Erreur getOrganizationSubscriptions :", error);
    next(error); // Laisse le middleware global gérer l'erreur
  }
};

// Récupérer un abonnement par ID
export const getSubscriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: { plan: true },
    });
    if (!subscription)
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    return ResponseApi.success(res, "Abonnement trouvé", 200, subscription);
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

// Mettre à jour un abonnement
export const updateSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planId, renewalType } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id: Number(id) },
      data: { planId, renewalType },
    });

    return ResponseApi.success(res, "Abonnement mis à jour", 200, subscription);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Supprimer un abonnement
export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Abonnement supprimé", 200, subscription);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

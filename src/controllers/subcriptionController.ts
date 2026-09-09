// src/controllers/subscriptionController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Subscription } from "../typages/subscription.js";
import { SubscriptionStatus } from "../../generated/prisma/enums.js";
import { PaymentStatus, PaymentMethod } from "../typages/payment.js";
import { Invoices,InvoiceStatus } from  "../typages/invoices.js";

// Créer un abonnement
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const { organizationId, planId, renewalType } = req.body;

    if (!organizationId || !planId) {
      return ResponseApi.error(res, "organizationId et planId requis", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.create({
        data: {
          organizationId,
          planId,
          renewalType,
          status: SubscriptionStatus.active,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
        include: { plan: true },
      });

      // price peut être un Prisma.Decimal — à convertir explicitement
      const priceAsNumber = Number(subscription.plan.price);

      const payment = await tx.payment.create({
        data: {
          organizationId,
          amount: priceAsNumber,
          method: PaymentMethod.mobile_money,
          status: PaymentStatus.SUCCESS,
          reference: `SUB-${subscription.id}`,
          userId: req.user?.id,
          paidAt: new Date(),
        },
      });

      const invoice = await tx.invoice.create({
        data: {
          organizationId,
          subscriptionId: subscription.id,
          amount: priceAsNumber,
          status: InvoiceStatus.paid,
          currency: "XAF",
          paymentMethod: PaymentMethod.mobile_money,
          issuedAt: new Date(),
          dueAt: new Date(), // payée immédiatement — à confirmer selon ta règle métier
        },
      });

      return { subscription, payment, invoice };
    });

    return ResponseApi.success(
      res,
      "Abonnement + paiement initial enregistrés",
      201,
      result.subscription,
    );
  } catch (error) {
    console.error(error);
    // En dev seulement — ne jamais exposer error.message brut en prod
    const message = process.env.NODE_ENV === "development"
      ? (error as Error).message
      : "Erreur serveur";
    return ResponseApi.error(res, message, 500);
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
  next: NextFunction,
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
          plan: true, // Détails du plan
          organization: true, // Optionnel : infos organisation
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return ResponseApi.success(
      res,
      "Liste des abonnements récupérée avec succès",
      200,
      {
        subscriptions,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalItems / limitNumber),
          totalItems,
          limit: limitNumber,
          hasNext: pageNumber * limitNumber < totalItems,
          hasPrevious: pageNumber > 1,
        },
      },
    );
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

// src/controllers/subscriptionController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { BillingInterval } from "../typages/subscription.js";
import { PaymentMethod } from "../typages/payment.js";

// =====================================================
// HELPERS
// =====================================================

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function computePeriodEnd(start: Date, interval: BillingInterval): Date {
  return interval === "YEARLY" ? addYears(start, 1) : addMonths(start, 1);
}

function resolvePlanPrice(
  plan: { priceMonthly: number; priceYearly?: number | null },
  interval: BillingInterval,
): number {
  if (interval === "YEARLY") {
    return Number(plan.priceYearly ?? plan.priceMonthly * 12);
  }
  return Number(plan.priceMonthly);
}

// =====================================================
// CREATE SUBSCRIPTION
// =====================================================
export const createSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      organizationId,
      planId,
      billingInterval = "MONTHLY",
      trialDays = 0,
      method = "mobile_money",
      provider,
      providerRef,
      notes,
    } = req.body;

    if (!organizationId || !planId) {
      return ResponseApi.error(
        res,
        "organizationId et planId sont requis",
        400,
      );
    }

    const plan = await prisma.plan.findUnique({
      where: { id: Number(planId) },
    });

    if (!plan || !plan.isActive) {
      return ResponseApi.error(res, "Plan introuvable ou inactif", 404);
    }

    // Optionnel : empêcher plusieurs abonnements actifs
    const existingActive = await prisma.subscription.findFirst({
      where: {
        organizationId: Number(organizationId),
        status: { in: ["TRIALING", "ACTIVE", "PAST_DUE"] },
      },
    });

    if (existingActive) {
      return ResponseApi.error(
        res,
        "Cette organisation a déjà un abonnement actif",
        400,
      );
    }

    const interval = (billingInterval as BillingInterval) || "MONTHLY";
    const amount = resolvePlanPrice(plan, interval);
    const now = new Date();

    const hasTrial = Number(trialDays) > 0;
    const trialStart = hasTrial ? now : null;
    const trialEnd = hasTrial
      ? new Date(now.getTime() + Number(trialDays) * 24 * 60 * 60 * 1000)
      : null;

    const currentPeriodStart = hasTrial && trialEnd ? trialEnd : now;
    const currentPeriodEnd = computePeriodEnd(currentPeriodStart, interval);

    const result = await prisma.$transaction(
      async (tx) => {
        const subscription = await tx.subscription.create({
          data: {
            organizationId: Number(organizationId),
            planId: Number(planId),
            status: hasTrial ? "TRIALING" : "ACTIVE",
            billingInterval: interval,
            amount,
            currency: plan.currency || "XOF",
            trialStart,
            trialEnd,
            currentPeriodStart,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
            notes: notes || null,
          },
          include: {
            plan: true,
            organization: true,
          },
        });

        // Si pas d'essai → créer facture + paiement initial
        let invoice = null;
        let payment = null;

        if (!hasTrial) {
          const invoiceNumber = `INV-${new Date().getFullYear()}-${String(
            subscription.id,
          ).padStart(6, "0")}`;

          invoice = await tx.invoice.create({
            data: {
              organizationId: Number(organizationId),
              subscriptionId: subscription.id,
              number: invoiceNumber,
              status: "PAID",
              amount,
              taxAmount: 0,
              totalAmount: amount,
              currency: plan.currency || "XOF",
              periodStart: currentPeriodStart,
              periodEnd: currentPeriodEnd,
              method: (method as PaymentMethod) || PaymentMethod.mobile_money,
              dueDate: now,
              paidAt: now,
              issuedAt: now,
            },
         
          });

          payment = await tx.subscriptionPayment.create({
            data: {
              organizationId: Number(organizationId),
              subscriptionId: subscription.id,
              invoiceId: invoice.id,
              amount,
              currency: plan.currency || "XOF",
              method: (method as PaymentMethod) || PaymentMethod.mobile_money,
              status: "PAID",
              provider: provider || null,
              providerRef: providerRef || null,
              paidAt: now,
              notes: notes || `Paiement initial abonnement `,
            },
          });
        }

        return { subscription, invoice, payment };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      },
    );

    return ResponseApi.success(
      res,
      hasTrial
        ? "Abonnement créé en période d'essai"
        : "Abonnement + paiement initial enregistrés",
      201,
      result,
    );
  } catch (error) {
    console.error("createSubscription:", error);
    next(error);
  }
};

// =====================================================
// GET ORGANIZATION SUBSCRIPTIONS
// =====================================================
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
    const limitNumber = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      organizationId: Number(organizationId),
    };

    if (status) {
      where.status = status;
    }

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
        orderBy: { createdAt: "desc" },
        include: {
          plan: true,
          organization: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des abonnements récupérée", 200, {
      subscriptions,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalItems / limitNumber) || 1,
        totalItems,
        limit: limitNumber,
        hasNext: pageNumber * limitNumber < totalItems,
        hasPrevious: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("getOrganizationSubscriptions:", error);
    next(error);
  }
};

// =====================================================
// GET SUBSCRIPTION BY ID
// =====================================================
export const getSubscriptionById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: {
        plan: true,
        organization: {
          select: { id: true, name: true },
        },
        invoices: {
          orderBy: { issuedAt: "desc" },
          take: 10,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    }

    return ResponseApi.success(res, "Abonnement trouvé", 200, subscription);
  } catch (error) {
    console.error("getSubscriptionById:", error);
    next(error);
  }
};

// =====================================================
// GET CURRENT SUBSCRIPTION (mon abonnement)
// =====================================================
export const getCurrentSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId =
      req.body.organizationId ||
      req.query.organizationId ||
      (req as any).user?.organizationId;

    if (!organizationId) {
      return ResponseApi.error(res, "organizationId requis", 400);
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: Number(organizationId),
        status: { in: ["TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        plan: true,
        invoices: {
          orderBy: { issuedAt: "desc" },
          take: 5,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!subscription) {
      return ResponseApi.error(res, "Aucun abonnement trouvé", 404);
    }

    return ResponseApi.success(
      res,
      "Abonnement courant récupéré",
      200,
      subscription,
    );
  } catch (error) {
    console.error("getCurrentSubscription:", error);
    next(error);
  }
};

// =====================================================
// UPDATE SUBSCRIPTION (changement de plan / intervalle)
// =====================================================
export const updateSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { planId, billingInterval, notes } = req.body;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const existing = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: { plan: true },
    });

    if (!existing) {
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    }

    if (
      ["EXPIRED", "CANCELLED"].includes(existing.status) &&
      existing.endedAt
    ) {
      return ResponseApi.error(
        res,
        "Impossible de modifier un abonnement terminé",
        400,
      );
    }

    let amount = existing.amount;
    let currency = existing.currency;
    let newPlanId = existing.planId;
    let interval = existing.billingInterval;

    if (planId) {
      const plan = await prisma.plan.findUnique({
        where: { id: Number(planId) },
      });
      if (!plan || !plan.isActive) {
        return ResponseApi.error(res, "Plan introuvable ou inactif", 404);
      }
      newPlanId = plan.id;
      interval =
        (billingInterval as BillingInterval) || existing.billingInterval;
      amount = resolvePlanPrice(plan, interval as BillingInterval);
      currency = plan.currency || currency;
    } else if (billingInterval) {
      interval = billingInterval as BillingInterval;
      amount = resolvePlanPrice(existing.plan, interval as BillingInterval);
    }

    const subscription = await prisma.subscription.update({
      where: { id: Number(id) },
      data: {
        planId: newPlanId,
        billingInterval: interval,
        amount,
        currency,
        ...(notes !== undefined && { notes }),
      },
      include: { plan: true },
    });

    return ResponseApi.success(res, "Abonnement mis à jour", 200, subscription);
  } catch (error) {
    console.error("updateSubscription:", error);
    next(error);
  }
};

// =====================================================
// CANCEL SUBSCRIPTION
// =====================================================
export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { immediate = false } = req.body; // true = coupure immédiate

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const existing = await prisma.subscription.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    }

    if (["CANCELLED", "EXPIRED"].includes(existing.status)) {
      return ResponseApi.error(res, "Abonnement déjà annulé ou expiré", 400);
    }

    const now = new Date();

    const subscription = await prisma.subscription.update({
      where: { id: Number(id) },
      data: immediate
        ? {
            status: "CANCELLED",
            cancelAtPeriodEnd: false,
            cancelledAt: now,
            endedAt: now,
          }
        : {
            // reste actif jusqu'à la fin de période
            cancelAtPeriodEnd: true,
            cancelledAt: now,
            status: "CANCELLED",
          },
      include: { plan: true },
    });

    return ResponseApi.success(
      res,
      immediate
        ? "Abonnement annulé immédiatement"
        : "Abonnement annulé à la fin de la période en cours",
      200,
      subscription,
    );
  } catch (error) {
    console.error("cancelSubscription:", error);
    next(error);
  }
};

// =====================================================
// RENEW / REACTIVATE (optionnel)
// =====================================================
export const renewSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { method = "MOBILE_MONEY", provider, providerRef } = req.body;

    const existing = await prisma.subscription.findUnique({
      where: { id: Number(id) },
      include: { plan: true },
    });

    if (!existing) {
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    }

    const now = new Date();
    const periodStart = now;
    const periodEnd = computePeriodEnd(
      periodStart,
      existing.billingInterval as BillingInterval,
    );
    const amount = existing.amount;

    const result = await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.update({
        where: { id: Number(id) },
        data: {
          status: "ACTIVE",
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
          endedAt: null,
        },
        include: { plan: true },
      });

      const invoiceNumber = `INV-${now.getFullYear()}-${String(id).padStart(6, "0")}-R`;

      const invoice = await tx.invoice.create({
        data: {
          organizationId: existing.organizationId,
          subscriptionId: existing.id,
          number: invoiceNumber,
          status: "PAID",
          amount,
          taxAmount: 0,
          totalAmount: amount,
          currency: existing.currency,
          periodStart,
          periodEnd,
          dueDate: now,
          paidAt: now,
          issuedAt: now,
        },
      });

      const payment = await tx.subscriptionPayment.create({
        data: {
          organizationId: existing.organizationId,
          subscriptionId: existing.id,
          invoiceId: invoice.id,
          amount,
          currency: existing.currency,
          method: method as PaymentMethod,
          status: "PAID",
          provider: provider || null,
          providerRef: providerRef || null,
          paidAt: now,
          notes: `Renouvellement abonnement #${existing.id}`,
        },
      });

      return { subscription, invoice, payment };
    });

    return ResponseApi.success(res, "Abonnement renouvelé", 200, result);
  } catch (error) {
    console.error("renewSubscription:", error);
    next(error);
  }
};

// =====================================================
// DELETE SUBSCRIPTION (hard delete — plutôt admin)
// =====================================================
export const deleteSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const existing = await prisma.subscription.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    }

    // Soft delete recommandé en prod ; hard delete ici si tu le veux vraiment
    await prisma.subscription.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Abonnement supprimé", 200, {
      id: Number(id),
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Abonnement introuvable", 404);
    }
    console.error("deleteSubscription:", error);
    next(error);
  }
};

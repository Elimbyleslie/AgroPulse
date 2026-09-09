// src/controllers/subscriptionPaymentController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// ======================================================
// CREATE SubscriptionPayment
// ======================================================
export const createSubscriptionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      organizationId,
      subscriptionId,
      invoiceId,
      amount,
      currency = "XOF",
      method,
      status = "PENDING",
      provider,
      providerRef,
      paidAt,
      notes,
      metadata,
    } = req.body;

    if (!organizationId || !amount || !method) {
      return ResponseApi.error(
        res,
        "organizationId, amount et method sont obligatoires",
        400,
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.subscriptionPayment.create({
        data: {
          organizationId: Number(organizationId),
          subscriptionId: subscriptionId ? Number(subscriptionId) : null,
          invoiceId: invoiceId ? Number(invoiceId) : null,
          amount: Number(amount),
          currency,
          method,
          status,
          provider: provider || null,
          providerRef: providerRef || null,
          paidAt:
            status === "PAID"
              ? paidAt
                ? new Date(paidAt)
                : new Date()
              : paidAt
                ? new Date(paidAt)
                : null,
          notes: notes || null,
          metadata: metadata ?? null,
        },
        include: {
          organization: { select: { id: true, name: true } },
          subscription: true,
          invoice: true,
        },
      });

      // Si payé + facture liée → marquer la facture PAID
      if (status === "PAID" && invoiceId) {
        await tx.invoice.update({
          where: { id: Number(invoiceId) },
          data: {
            status: "PAID",
            paidAt: payment.paidAt ?? new Date(),
          },
        });
      }

      // Si payé + abonnement → activer / renouveler la période si besoin
      if (status === "PAID" && subscriptionId) {
        const sub = await tx.subscription.findUnique({
          where: { id: Number(subscriptionId) },
        });
        if (
          sub &&
          ["TRIALING", "PAST_DUE", "CANCELLED", "EXPIRED"].includes(sub.status)
        ) {
          await tx.subscription.update({
            where: { id: sub.id },
            data: {
              status: "ACTIVE",
              cancelAtPeriodEnd: false,
              cancelledAt: null,
              endedAt: null,
            },
          });
        }
      }

      return payment;
    });

    return ResponseApi.success(
      res,
      "Paiement d'abonnement enregistré",
      201,
      result,
    );
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL SubscriptionPayments
// ======================================================
export const getAllSubscriptionPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      organizationId,
      subscriptionId,
      invoiceId,
      status,
      method,
      search,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {};

    if (organizationId) where.organizationId = Number(organizationId);
    if (subscriptionId) where.subscriptionId = Number(subscriptionId);
    if (invoiceId) where.invoiceId = Number(invoiceId);
    if (status) where.status = status;
    if (method) where.method = method;

    if (search) {
      where.OR = [
        { providerRef: { contains: String(search), mode: "insensitive" } },
        { notes: { contains: String(search), mode: "insensitive" } },
        { provider: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [payments, totalItems] = await Promise.all([
      prisma.subscriptionPayment.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          organization: { select: { id: true, name: true } },
          subscription: { include: { plan: true } },
          invoice: true,
        },
      }),
      prisma.subscriptionPayment.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des paiements d'abonnement", 200, {
      payments,
      pagination: {
        currentPage: pageNumber,
        previousPage: pageNumber > 1 ? pageNumber - 1 : null,
        nextPage: pageNumber * limitNumber < totalItems ? pageNumber + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limitNumber) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET by ID
// ======================================================
export const getSubscriptionPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: Number(id) },
      include: {
        organization: { select: { id: true, name: true } },
        subscription: { include: { plan: true } },
        invoice: true,
      },
    });

    if (!payment) {
      return ResponseApi.error(res, "Paiement introuvable", 404);
    }

    return ResponseApi.success(res, "Paiement récupéré", 200, payment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE status (ex: webhook mobile money)
// ======================================================
export const updateSubscriptionPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status, providerRef, paidAt, notes } = req.body;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }
    if (!status) {
      return ResponseApi.error(res, "status requis", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.subscriptionPayment.update({
        where: { id: Number(id) },
        data: {
          status,
          ...(providerRef !== undefined && { providerRef }),
          ...(notes !== undefined && { notes }),
          paidAt:
            status === "PAID"
              ? paidAt
                ? new Date(paidAt)
                : new Date()
              : undefined,
        },
        include: {
          invoice: true,
          subscription: true,
        },
      });

      if (status === "PAID" && payment.invoiceId) {
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: "PAID", paidAt: payment.paidAt ?? new Date() },
        });
      }

      if (status === "PAID" && payment.subscriptionId) {
        await tx.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: "ACTIVE",
            cancelAtPeriodEnd: false,
            cancelledAt: null,
            endedAt: null,
          },
        });
      }

      return payment;
    });

    return ResponseApi.success(
      res,
      "Statut du paiement mis à jour",
      200,
      result,
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Paiement introuvable", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE
// ======================================================
export const deleteSubscriptionPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.subscriptionPayment.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Paiement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Paiement introuvable", 404);
    }
    next(error);
  }
};

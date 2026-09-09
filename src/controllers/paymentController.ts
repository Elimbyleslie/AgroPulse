// src/controllers/paymentController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// ======================================================
// CREATE Payment (ferme)
// ======================================================
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      farmId,
      saleId,
      purchaseId,
      expenseId,
      amount,
      currency = "XOF",
      method,
      status = "COMPLETED",
      reference,
      notes,
      paidAt,
    } = req.body;

    if (!farmId || !amount || !method) {
      return ResponseApi.error(
        res,
        "farmId, amount et method sont obligatoires",
        400,
      );
    }

    // Au moins une cible
    if (!saleId && !purchaseId && !expenseId) {
      return ResponseApi.error(
        res,
        "Au moins un de saleId, purchaseId ou expenseId est requis",
        400,
      );
    }

    const payment = await prisma.payment.create({
      data: {
        farmId: Number(farmId),
        saleId: saleId ? Number(saleId) : null,
        purchaseId: purchaseId ? Number(purchaseId) : null,
        expenseId: expenseId ? Number(expenseId) : null,
        amount: Number(amount),
        currency,
        method,
        status,
        reference: reference || null,
        notes: notes || null,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        recordedById: (req as any).user?.id ?? null,
      },
      include: {
        farm: true,
        sale: true,
        purchase: true,
        expense: true,
        recordedBy: { select: { id: true, name: true } },
      },
    });

    return ResponseApi.success(res, "Paiement créé avec succès", 201, payment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Payments
// ======================================================
export const getAllPayments = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId?: string;
      saleId?: string;
      method?: string;
      status?: string;
      search?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, saleId, method, status, search } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (farmId) where.farmId = Number(farmId);
    if (saleId) where.saleId = Number(saleId);
    if (method) where.method = method;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [payments, totalItems] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paidAt: "desc" },
        include: {
          farm: { select: { id: true, name: true } },
          sale: true,
          purchase: true,
          expense: true,
          recordedBy: { select: { id: true, name: true } },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des paiements récupérée", 200, {
      payments,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET Payment by ID
// ======================================================
export const getPaymentById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const payment = await prisma.payment.findUnique({
      where: { id: Number(id) },
      include: {
        farm: true,
        sale: true,
        purchase: true,
        expense: true,
        recordedBy: { select: { id: true, name: true } },
      },
    });

    if (!payment) {
      return ResponseApi.error(res, "Paiement non trouvé", 404);
    }

    return ResponseApi.success(res, "Paiement récupéré", 200, payment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Payment
// ======================================================
export const updatePayment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const {
      amount,
      method,
      status,
      reference,
      notes,
      paidAt,
      saleId,
      purchaseId,
      expenseId,
    } = req.body;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const updated = await prisma.payment.update({
      where: { id: Number(id) },
      data: {
        ...(amount !== undefined && { amount: Number(amount) }),
        ...(method !== undefined && { method }),
        ...(status !== undefined && { status }),
        ...(reference !== undefined && { reference }),
        ...(notes !== undefined && { notes }),
        ...(paidAt !== undefined && {
          paidAt: paidAt ? new Date(paidAt) : null,
        }),
        ...(saleId !== undefined && {
          saleId: saleId ? Number(saleId) : null,
        }),
        ...(purchaseId !== undefined && {
          purchaseId: purchaseId ? Number(purchaseId) : null,
        }),
        ...(expenseId !== undefined && {
          expenseId: expenseId ? Number(expenseId) : null,
        }),
      },
      include: {
        farm: true,
        sale: true,
        recordedBy: { select: { id: true, name: true } },
      },
    });

    return ResponseApi.success(res, "Paiement mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Paiement non trouvé", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Payment
// ======================================================
export const deletePayment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.payment.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Paiement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Paiement non trouvé", 404);
    }
    next(error);
  }
};
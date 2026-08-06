import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Payment } from "../typages/payment.js";

// ======================================================
// CREATE Payment
// ======================================================
export const createPayment = async (
  req: Request<{}, {}, Payment>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { amount, method, reference } = req.body;

    if (!amount || !method || !reference) {
      return ResponseApi.error(
        res,
        "amount, method et reference sont obligatoires",
        400,
      );
    }

    const payment = await prisma.payment.create({
      data: req.body,
    });

    return ResponseApi.success(res, "Paiement créé avec succès", 201, payment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Payments (pagination + filtres)
// ======================================================
export const getAllPayments = async (
  req: Request<
    {},
    {},
    {},
    {
      method?: string;
      status?: string;
      search?: string;
      page?: string;
      limit?: string;
      organizationId?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { method, status, search, organizationId } = req.query;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filtres
    if (organizationId) where.organizationId = Number(organizationId);
    if (method) where.method = method;
    if (status) where.status = status;

    // Recherche sur référence ou d'autres champs
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
        orderBy: { paidAt: "desc" },        // Mieux que par id
        include: {
          user: true,
          sale: true,
          organization: true,
          farm: true,
          purchase: true,
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
        totalPage: Math.ceil(totalItems / limit),
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
        user: true,
        sale: true,
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
  req: Request<{ id: string }, {}, Partial<Payment>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const updated = await prisma.payment.update({
      where: { id: Number(id) },
      data,
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

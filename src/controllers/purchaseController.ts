import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Purchase } from "../typages/purchase.js";

// ======================================================
// CREATE Purchase
// ======================================================
export const createPurchase = async (
  req: Request<{}, {}, Purchase>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, supplierId, totalAmount, purchaseDate, invoiceRef } = req.body;

    if (!farmId) {
      return ResponseApi.error(res, "farmId est obligatoire", 400);
    }

    const purchase = await prisma.purchase.create({
      data: {
        farmId,
        supplierId,
        totalAmount,
        purchaseDate,
        invoiceRef,
      },
    });

    return ResponseApi.success(res, "Achat créé avec succès", 201, purchase);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Purchases (pagination + filter)
// ======================================================
export const getAllPurchases = async (
  req: Request<{}, {}, {}, { search?: string; farmId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, farmId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.invoiceRef = { contains: search, mode: "insensitive" };
    }

    if (farmId) {
      where.farmId = Number(farmId);
    }

    const purchases = await prisma.purchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        payments: true,
        farm: true,
      },
    });

    const totalItems = await prisma.purchase.count({ where });

    return ResponseApi.success(res, "Liste des achats récupérée", 200, {
      purchases,
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
// GET Purchase by ID
// ======================================================
export const getPurchaseById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: Number(id) },
      include: {
        payments: true,
        farm: true,
      },
    });

    if (!purchase) {
      return ResponseApi.error(res, "Achat non trouvé", 404);
    }

    return ResponseApi.success(res, "Achat récupéré", 200, purchase);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Purchase
// ======================================================
export const updatePurchase = async (
  req: Request<{ id: string }, {}, Partial<Purchase>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const updated = await prisma.purchase.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Achat mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Achat non trouvé", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Purchase
// ======================================================
export const deletePurchase = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.purchase.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Achat supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Achat non trouvé", 404);
    }
    next(error);
  }
};

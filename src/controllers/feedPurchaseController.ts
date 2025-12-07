import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { FeedPurchase } from "../typages/feed.js";


// ======================================================
// CREATE PURCHASE
// ======================================================
export const createFeedPurchase = async (
  req: Request<{}, {}, FeedPurchase>,
  res: Response,
  next: NextFunction
) => {
  try {
       if (req.body.quantity && req.body.unitPrice) {
      req.body.totalAmount = req.body.quantity * req.body.unitPrice;
    }
    
    const purchase = await prisma.feedPurchase.create({
      data: req.body,
    });

    return ResponseApi.success(
      res,
      "Achat enegistré avec succès",
      201,
      purchase
    );
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL PURCHASES
// ======================================================
export const getAllFeedPurchases = async (
  req: Request<{}, {}, {}, { supplierId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { supplierId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (supplierId) where.supplierId = Number(supplierId);

    const purchases = await prisma.feedPurchase.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: { supplier: true, farm: true },
    });

    const totalItems = await prisma.feedPurchase.count({ where });

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
// GET PURCHASE BY ID
// ======================================================
export const getFeedPurchaseById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const purchase = await prisma.feedPurchase.findUnique({
      where: { id: Number(id) },
      include: { supplier: true, farm: true },
    });

    if (!purchase)
      return ResponseApi.error(res, "Achat non trouvé", 404);

    return ResponseApi.success(res, "Achat récupéré", 200, purchase);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE PURCHASE
// ======================================================
export const updateFeedPurchase = async (
  req: Request<{ id: string }, {}, Partial<FeedPurchase>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);
    // auto calcul 
    if (req.body.quantity && req.body.unitPrice) {
      req.body.totalAmount = req.body.quantity * req.body.unitPrice;
    }

    const updated = await prisma.feedPurchase.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Achat mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Achat non trouvé", 404);
    next(error);
  }
};

// ======================================================
// DELETE PURCHASE
// ======================================================
export const deleteFeedPurchase = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.feedPurchase.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Achat supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Achat non trouvé", 404);
    next(error);
  }
};

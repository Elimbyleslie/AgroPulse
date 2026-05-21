import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { autoConvertUnit } from "../helpers/autoconverter.js";

// ── include réutilisable pour éviter la répétition ──────────────────────────
const feedStockInclude = {
  farm: true,
  usages: true,
  feedings: true,
  feedingPlans: true,
  entries: true, // FeedPurchase[] — ajouté
} as const;

// ── CREATE ───────────────────────────────────────────────────────────────────
export const createFeedStock = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, quantity, unit, farmId, notes, minQuantity, category } =
      req.body;

    // Validation minimale des champs obligatoires
    if (!name || quantity === undefined || !unit || !farmId) {
      return ResponseApi.error(
        res,
        "name, quantity, unit et farmId sont requis",
        400,
      );
    }

    const stock = await prisma.feedStock.create({
      data: {
        name,
        quantity: Number(quantity),
        unit,
        farmId: Number(farmId),
        notes: notes ?? null,
        minQuantity: minQuantity ? Number(minQuantity) : null,
        category: category ?? null,
      },
      include: feedStockInclude,
    });

    return ResponseApi.success(res, "FeedStock créé", 201, stock);
  } catch (error) {
    next(error);
  }
};

// ── GET ALL (avec pagination) ─────────────────────────────────────────────────
export const getAllFeedStocks = async (
  req: Request<{}, {}, {}, { farmId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId } = req.query;

    // 🛡️ SÉCURITÉ : Forcer la présence de farmId
    if (!farmId) {
      return ResponseApi.error(
        res,
        "Le farmId est requis pour filtrer les données",
        400,
      );
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {
      farmId: Number(farmId), 
    };

    const [stocks, totalItems] = await prisma.$transaction([
      prisma.feedStock.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: feedStockInclude,
      }),
      prisma.feedStock.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des FeedStocks récupérée", 200, {
      stocks,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET BY ID ─────────────────────────────────────────────────────────────────
export const getFeedStockById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stock = await prisma.feedStock.findUnique({
      where: { id: Number(req.params.id) },
      include: feedStockInclude,
    });

    if (!stock) return ResponseApi.error(res, "FeedStock non trouvé", 404);
    return ResponseApi.success(res, "FeedStock récupéré", 200, stock);
  } catch (error) {
    next(error);
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateFeedStock = async (
  req: Request<
    { id: string },
    {},
    Partial<{
      name: string;
      quantity: number;
      unit: string;
      notes: string;
      minQuantity: number;
      category: string;
    }>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, quantity, unit, notes, minQuantity, category } = req.body;

    // Résoudre l'unité finale et la quantité finale AVANT d'écrire en DB.
    // Si l'utilisateur envoie quantity=0.5 unit="tonne", on convertit en 500 kg.
    let finalQuantity  = quantity  !== undefined ? Number(quantity)  : undefined;
    let finalUnit      = unit      !== undefined ? unit              : undefined;
    let finalMinQty    = minQuantity !== undefined ? Number(minQuantity) : undefined;

    if (finalQuantity !== undefined && finalUnit !== undefined) {
      const converted = autoConvertUnit(finalQuantity, finalUnit);
      const unitChanged = converted.unit !== finalUnit;

      finalQuantity = converted.quantity;
      finalUnit     = converted.unit;

      // Si l'unité a changé et que l'utilisateur a aussi envoyé un minQuantity,
      // on le convertit dans la même unité.
      if (unitChanged && finalMinQty !== undefined) {
        finalMinQty = finalMinQty * 1000; // tonne → kg
      }
    }

    // Cas où seule la quantité change (sans unit dans le body) :
    // on récupère l'unité actuelle en DB pour vérifier si conversion nécessaire.
    if (finalQuantity !== undefined && finalUnit === undefined) {
      const current = await prisma.feedStock.findUnique({
        where:  { id: Number(req.params.id) },
        select: { unit: true, minQuantity: true },
      });

      if (current) {
        const converted = autoConvertUnit(finalQuantity, current.unit);
        const unitChanged = converted.unit !== current.unit;

        finalQuantity = converted.quantity;

        if (unitChanged) {
          finalUnit = converted.unit;
          // minQuantity envoyé par le user ou celui déjà en DB
          const baseMinQty = finalMinQty ?? current.minQuantity ?? undefined;
          if (baseMinQty !== undefined) {
            finalMinQty = baseMinQty * 1000;
          }
        }
      }
    }

    const updated = await prisma.feedStock.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name          !== undefined && { name }),
        ...(finalQuantity !== undefined && { quantity:    finalQuantity }),
        ...(finalUnit     !== undefined && { unit:        finalUnit     }),
        ...(notes         !== undefined && { notes }),
        ...(finalMinQty   !== undefined && { minQuantity: finalMinQty  }),
        ...(category      !== undefined && { category }),
      },
      include: feedStockInclude,
    });

    return ResponseApi.success(res, "FeedStock mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "FeedStock non trouvé", 404);
    next(error);
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteFeedStock = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deleted = await prisma.feedStock.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "FeedStock supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "FeedStock non trouvé", 404);
    next(error);
  }
};

// controllers/feedingPlan.controller.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import  { autoConvertUnit } from "../helpers/autoconverter.js";


const feedingPlanInclude = {
  animal:    true,
  feedStock: true,
  farm:      true,
  user:      true,
} as const;

// ── HELPER : conversion tonne → kg si quantité < 1 tonne ─────────────────────


// ── CREATE ────────────────────────────────────────────────────────────────────
export const createFeedingPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      animalId, feedStockId, quantity, unit,
      frequency, startDate, endDate,
      farmId, userId, notes,
      lotId, herdId, penId,
    } = req.body;

    const plan = await prisma.feedingPlan.create({
      data: {
        animalId:    animalId    ? Number(animalId)    : null,
        lotId:       lotId       ? Number(lotId)       : null,
        herdId:      herdId      ? Number(herdId)      : null,
        penId:       penId       ? Number(penId)       : null,
        feedStockId: Number(feedStockId),
        quantity:    Number(quantity),
        unit,
        frequency,
        startDate:   new Date(startDate),
        endDate:     endDate ? new Date(endDate) : null,
        farmId:      Number(farmId),
        userId:      Number(userId),
        notes:       notes ?? null,
      },
      include: feedingPlanInclude,
    });

    return ResponseApi.success(res, "Plan de ration créé", 201, plan);
  } catch (error) {
    next(error);
  }
};

// ── GET ALL (pagination + filtres) ────────────────────────────────────────────
export const getAllFeedingPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, animalId, feedStockId, frequency, active } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, "Le farmId est requis pour filtrer les données", 400);
    }

    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const where: any = { farmId: Number(farmId) };

    if (animalId)    where.animalId    = Number(animalId);
    if (feedStockId) where.feedStockId = Number(feedStockId);
    if (frequency)   where.frequency   = frequency;

    if (active === "true") {
      where.AND = [
        { farmId: Number(farmId) },
        { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
      ];
    }

    const [plans, totalItems] = await prisma.$transaction([
      prisma.feedingPlan.findMany({
        where,
        skip,
        take:     limit,
        orderBy:  { createdAt: "desc" },
        include:  feedingPlanInclude,
      }),
      prisma.feedingPlan.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des plans de ration récupérée", 200, {
      plans,
      pagination: {
        currentPage:  page,
        previousPage: page > 1                  ? page - 1 : null,
        nextPage:     page * limit < totalItems  ? page + 1 : null,
        totalItems,
        totalPages:   Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET BY ID ─────────────────────────────────────────────────────────────────
export const getFeedingPlanById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plan = await prisma.feedingPlan.findUnique({
      where:   { id: Number(req.params.id) },
      include: feedingPlanInclude,
    });

    if (!plan) return ResponseApi.error(res, "Plan de ration non trouvé", 404);
    return ResponseApi.success(res, "Plan de ration récupéré", 200, plan);
  } catch (error) {
    next(error);
  }
};

// ── GET BY ANIMAL ─────────────────────────────────────────────────────────────
export const getFeedingPlansByAnimal = async (
  req: Request<{ animalId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plans = await prisma.feedingPlan.findMany({
      where:   { animalId: Number(req.params.animalId) },
      orderBy: { startDate: "desc" },
      include: feedingPlanInclude,
    });

    return ResponseApi.success(res, "Plans de ration de l'animal récupérés", 200, plans);
  } catch (error) {
    next(error);
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateFeedingPlan = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      quantity, unit, frequency,
      startDate, endDate, notes,
      feedStockId,
    } = req.body;

    const updated = await prisma.feedingPlan.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(feedStockId !== undefined && { feedStockId: Number(feedStockId) }),
        ...(quantity    !== undefined && { quantity:    Number(quantity)    }),
        ...(unit        !== undefined && { unit                             }),
        ...(frequency   !== undefined && { frequency                       }),
        ...(startDate   !== undefined && { startDate:   new Date(startDate) }),
        ...(endDate     !== undefined && { endDate:     endDate ? new Date(endDate) : null }),
        ...(notes       !== undefined && { notes                           }),
      },
      include: feedingPlanInclude,
    });

    return ResponseApi.success(res, "Plan de ration mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Plan de ration non trouvé", 404);
    next(error);
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteFeedingPlan = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deleted = await prisma.feedingPlan.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Plan de ration supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Plan de ration non trouvé", 404);
    next(error);
  }
};

// ── DISTRIBUTE ────────────────────────────────────────────────────────────────
// ── HELPERS ───────────────────────────────────────────────────────────────────

/** Convertit n'importe quelle quantité en grammes (unité commune de comparaison) */
const toGrams = (quantity: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case "g":      return quantity;
    case "kg":     return quantity * 1_000;
    case "tonne":  return quantity * 1_000_000;
    case "l":      return quantity * 1_000; // traité comme kg pour les liquides
    default:       return quantity;         // sac, botte : pas de conversion possible
  }
};

/** Convertit des grammes vers une unité cible */
const fromGrams = (grams: number, unit: string): number => {
  switch (unit.toLowerCase()) {
    case "g":      return grams;
    case "kg":     return grams / 1_000;
    case "tonne":  return grams / 1_000_000;
    case "l":      return grams / 1_000;
    default:       return grams;
  }
};

/** Unités convertibles entre elles */
const isWeightUnit = (unit: string) =>
  ["g", "kg", "tonne"].includes(unit.toLowerCase());

/** Convertit tonne → kg si quantité < 1 tonne */


// ── DISTRIBUTE ────────────────────────────────────────────────────────────────
export const distributeFeeding = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.feedingPlan.findUnique({
        where: { id: Number(id) },
        include: {
          animal: true,
          lot:  { include: { _count: { select: { animals: true } } } },
          herd: { include: { _count: { select: { animals: true } } } },
          pen:  { include: { _count: { select: { animals: true } } } },
        },
      });

      if (!plan) throw new Error("Plan introuvable");

      const stock = await tx.feedStock.findUnique({ where: { id: plan.feedStockId } });
      if (!stock) throw new Error("Stock introuvable");

      let animalCount = 1;
      if (plan.lot)  animalCount = plan.lot._count.animals;
      if (plan.herd) animalCount = plan.herd._count.animals;
      if (plan.pen)  animalCount = plan.pen._count.animals;

      const totalPlanQuantity = plan.quantity * animalCount; // ex: 300 kg

      // Vérification : les deux unités sont-elles convertibles entre elles ?
      const canConvert = isWeightUnit(stock.unit) && isWeightUnit(plan.unit);

      let stockQtyInPlanUnit: number;
      let totalToDeductInStockUnit: number;

      if (canConvert) {
        // Normalise tout en grammes pour comparer sans erreur d'unité
        const stockInGrams = toGrams(stock.quantity, stock.unit);
        const deductInGrams = toGrams(totalPlanQuantity, plan.unit);

        if (stockInGrams < deductInGrams) {
          // Affiche les valeurs dans l'unité du stock pour le message d'erreur
          stockQtyInPlanUnit = fromGrams(stockInGrams, stock.unit);
          throw new Error(
            `STOCK_INSUFFISANT: ${stock.quantity} ${stock.unit} disponible, ` +
            `${fromGrams(deductInGrams, stock.unit)} ${stock.unit} requis`,
          );
        }

        // Déduction : convertit la quantité du plan dans l'unité du stock
        totalToDeductInStockUnit = fromGrams(deductInGrams, stock.unit);
      } else {
        // Unités incompatibles (ex: sac vs kg) : on compare brut et on bloque si différent
        if (stock.unit !== plan.unit) {
          throw new Error(
            `UNITE_INCOMPATIBLE: impossible de convertir "${plan.unit}" en "${stock.unit}"`,
          );
        }
        // Même unité non-convertible : comparaison directe
        if (stock.quantity < totalPlanQuantity) {
          throw new Error(
            `STOCK_INSUFFISANT: ${stock.quantity} ${stock.unit} disponible, ` +
            `${totalPlanQuantity} ${stock.unit} requis`,
          );
        }
        totalToDeductInStockUnit = totalPlanQuantity;
      }

      const newQuantity = stock.quantity - totalToDeductInStockUnit;

      // Conversion automatique tonne → kg si on passe sous 1 tonne
      const { quantity: convertedQuantity, unit: convertedUnit } = autoConvertUnit(
        newQuantity,
        stock.unit,
      );
      const unitChanged = convertedUnit !== stock.unit;

      // Si l'unité change, on convertit aussi minQuantity
      const convertedMinQuantity =
        unitChanged && stock.minQuantity !== null && stock.minQuantity !== undefined
          ? stock.minQuantity * 1_000
          : stock.minQuantity;

      const updatedStock = await tx.feedStock.update({
        where: { id: plan.feedStockId },
        data: {
          quantity: convertedQuantity,
          ...(unitChanged && {
            unit:        convertedUnit,
            minQuantity: convertedMinQuantity,
          }),
        },
      });

      const updatedPlan = await tx.feedingPlan.update({
        where: { id: plan.id },
        data:  { lastDistributedAt: new Date() },
      });

      return {
        updatedStock,
        updatedPlan,
        conversion: unitChanged
          ? {
              from: { quantity: newQuantity,       unit: stock.unit,    minQuantity: stock.minQuantity    },
              to:   { quantity: convertedQuantity, unit: convertedUnit, minQuantity: convertedMinQuantity },
            }
          : null,
      };
    });

    return ResponseApi.success(res, "Distribution groupée réussie", 200, result);
  } catch (error: any) {
    if (error.message?.startsWith("STOCK_INSUFFISANT")) {
      return ResponseApi.error(res, error.message.replace("STOCK_INSUFFISANT: ", ""), 403);
    }
    if (error.message?.startsWith("UNITE_INCOMPATIBLE")) {
      return ResponseApi.error(res, error.message.replace("UNITE_INCOMPATIBLE: ", ""), 422);
    }
    if (error.message === "Plan introuvable") {
      return ResponseApi.error(res, "Plan introuvable", 404);
    }
    if (error.message === "Stock introuvable") {
      return ResponseApi.error(res, "Stock introuvable", 404);
    }
    return ResponseApi.error(res, "Erreur interne du serveur", 500);
  }
};
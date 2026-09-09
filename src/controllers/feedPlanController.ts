// controllers/feedingPlan.controller.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { autoConvertUnit } from "../helpers/autoconverter.js";

const feedingPlanInclude = {
  farm: { select: { id: true, name: true } },
  user: { select: { id: true, name: true } },
  animal: { select: { id: true, name: true } },
  lot: { select: { id: true, name: true } },
  herd: { select: { id: true, name: true } },
  pen: { select: { id: true, name: true } },
  feedStock: {   // ← Correspond à ton modèle actuel
    select: {
      id: true,
      name: true,
      unit: true,
      category: true,
      quantity: true,
    },
  },
} as const;

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createFeedingPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      animalId,
      lotId,
      herdId,
      penId,
      feedStockId,        // ← Correspond au modèle
      quantity,
      unit,
      frequency,
      startDate,
      endDate,
      farmId,
      userId,
      notes,
    } = req.body;

    const plan = await prisma.feedingPlan.create({
      data: {
        animalId: animalId ? Number(animalId) : null,
        lotId: lotId ? Number(lotId) : null,
        herdId: herdId ? Number(herdId) : null,
        penId: penId ? Number(penId) : null,
        feedStockId: Number(feedStockId),   // ← Important
        quantity: Number(quantity),
        unit,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        farmId: Number(farmId),
        userId: Number(userId),
        notes: notes ?? null,
      },
      include: feedingPlanInclude,
    });

    return ResponseApi.success(res, "Plan de ration créé avec succès", 201, plan);
  } catch (error: any) {
    console.error("Create FeedingPlan Error:", error);
    next(error);
  }
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
export const getAllFeedingPlans = async (
  req: Request<{}, {}, {}, { farmId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, page, limit } = req.query;

    const currentPage = Number(page) || 1;
    const take = Number(limit) || 10;
    const skip = (currentPage - 1) * take;

    const where: any = {};
    if (farmId) where.farmId = Number(farmId);

    const [feedingPlans, totalItems] = await Promise.all([
      prisma.feedingPlan.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: feedingPlanInclude,
      }),
      prisma.feedingPlan.count({ where }),
    ]);

    return ResponseApi.success(res, "Plans de ration récupérés", 200, {
      feedingPlans,
      pagination: {
        currentPage,
        totalPages: Math.ceil(totalItems / take),
        totalItems,
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
      where: { id: Number(req.params.id) },
      include: feedingPlanInclude,
    });

    if (!plan) return ResponseApi.error(res, "Plan de ration non trouvé", 404);
    return ResponseApi.success(res, "Plan récupéré", 200, plan);
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
      feedStockId,
      quantity,
      unit,
      frequency,
      startDate,
      endDate,
      notes,
    } = req.body;

    const updated = await prisma.feedingPlan.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(feedStockId !== undefined && { feedStockId: Number(feedStockId) }),
        ...(quantity !== undefined && { quantity: Number(quantity) }),
        ...(unit !== undefined && { unit }),
        ...(frequency !== undefined && { frequency }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(notes !== undefined && { notes }),
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

// ── DISTRIBUTE (mise à jour avec feedStock) ───────────────────────────────────
export const distributeFeeding = async (req: Request, res: Response, next:NextFunction) => {
  const { id } = req.params;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.feedingPlan.findUnique({
        where: { id: Number(id) },
        include: {
          feedStock: true,           // ← Important
          animal: true,
          lot: { include: { _count: { select: { animals: true } } } },
          herd: { include: { _count: { select: { animals: true } } } },
          pen: { include: { _count: { select: { animals: true } } } },
        },
      });

      if (!plan || !plan.feedStock) throw new Error("Plan ou stock introuvable");

      const stock = plan.feedStock;
      let animalCount = 1;
      if (plan.lot) animalCount = plan.lot._count.animals;
      if (plan.herd) animalCount = plan.herd._count.animals;
      if (plan.pen) animalCount = plan.pen._count.animals;

      const totalPlanQuantity = Number(plan.quantity) * animalCount;

      // Logique de conversion (tu peux réutiliser autoConvertUnit)
      if (Number(stock.quantity) < totalPlanQuantity) {
        throw new Error(`STOCK_INSUFFISANT: ${stock.quantity} ${stock.unit} disponible`);
      }

      const newQuantity = Number(stock.quantity) - totalPlanQuantity;

      const { quantity: convertedQuantity, unit: convertedUnit } = autoConvertUnit(newQuantity, stock.unit);

      const updatedStock = await tx.feedStock.update({
        where: { id: stock.id },
        data: { quantity: convertedQuantity, unit: convertedUnit },
      });

      const updatedPlan = await tx.feedingPlan.update({
        where: { id: plan.id },
        data: { lastDistributedAt: new Date() },
      });

      return { updatedPlan, updatedStock };
    });

    return ResponseApi.success(res, "Distribution effectuée avec succès", 200, result);
  } catch (error: any) {
    if (error.message?.includes("STOCK_INSUFFISANT")) {
      return ResponseApi.error(res, error.message, 403);
    }
    if (error.message === "Plan ou stock introuvable") {
      return ResponseApi.error(res, error.message, 404);
    }
    next(error);
  }
};
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

const stockMovementInclude = {
  inventory: {
    select: {
      id: true,
      name: true,
      unit: true,
      category: true,
      quantity: true,
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} as const;

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createStockMovement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { inventoryId, type, quantity, reference, notes, farmId, userId } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { id: Number(inventoryId) },
      });

      if (!inventory) throw new Error("Article d'inventaire introuvable");

      // Vérification que l'inventaire appartient à la ferme
      if (inventory.farmId !== Number(farmId)) {
        throw new Error("Cet article n'appartient pas à votre ferme");
      }

      const previousQuantity = Number(inventory.quantity);
      let newQuantity = previousQuantity;

      switch (type) {
        case "PURCHASE":
        case "RETURN":
          newQuantity += Number(quantity);
          break;
        case "USAGE":
        case "WASTE":
        case "TRANSFER":
          newQuantity -= Number(quantity);
          break;
        case "ADJUSTMENT":
          newQuantity = Number(quantity); // Quantité absolue
          break;
      }

      if (newQuantity < 0) {
        throw new Error("Quantité insuffisante pour ce mouvement");
      }

      const movement = await tx.stockMovement.create({
        data: {
          inventoryId: Number(inventoryId),
          type,
          quantity: Number(quantity),
          previousQuantity,
          newQuantity,
          reference: reference ?? null,
          notes: notes ?? null,
          userId: userId ? Number(userId) : null,
        },
        include: stockMovementInclude,
      });

      // Mise à jour de l'inventaire
      await tx.inventory.update({
        where: { id: Number(inventoryId) },
        data: { quantity: newQuantity },
      });

      return movement;
    });

    return ResponseApi.success(res, "Mouvement de stock créé avec succès", 201, result);
  } catch (error: any) {
    if (error.message.includes("introuvable")) {
      return ResponseApi.error(res, error.message, 404);
    }
    if (error.message === "Quantité insuffisante pour ce mouvement") {
      return ResponseApi.error(res, error.message, 400);
    }
    next(error);
  }
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
export const getAllStockMovements = async (
  req: Request<{}, {}, {}, { farmId?: string; inventoryId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, inventoryId, page, limit } = req.query;

    const currentPage = Number(page) || 1;
    const take = Number(limit) || 20;
    const skip = (currentPage - 1) * take;

    const where: any = {};
    if (farmId) where.inventory = { farmId: Number(farmId) };
    if (inventoryId) where.inventoryId = Number(inventoryId);

    const [movements, totalItems] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take,
        orderBy: { date: "desc" },
        include: stockMovementInclude,
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return ResponseApi.success(res, "Mouvements récupérés", 200, {
      movements,
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

// __UPDATE ___________________________________________________________________
export const updateStockMovement = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
    try {
      const { id } = req.params;
      const { inventoryId, type, quantity, reference, notes, userId } = req.body;
  
      const result = await prisma.stockMovement.update({
        where: { id: Number(id) },
        data: {
          inventoryId: Number(inventoryId),
          type,
          quantity: Number(quantity),
          reference: reference ?? null,
          notes: notes ?? null,
          userId: userId ? Number(userId) : null,
        },
        include: stockMovementInclude,
      });
  
      return ResponseApi.success(res, "Mouvement de stock mis à jour", 200, result);
    } catch (error: any) {
      if (error.message.includes("introuvable")) {
        return ResponseApi.error(res, error.message, 404);
      }
      if (error.message === "Quantité insuffisante pour ce mouvement") {
        return ResponseApi.error(res, error.message, 400);
      }
      next(error);
    }
}

// ── GET BY ID ─────────────────────────────────────────────────────────────────
export const getStockMovementById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const movement = await prisma.stockMovement.findUnique({
      where: { id: Number(req.params.id) },
      include: stockMovementInclude,
    });

    if (!movement) return ResponseApi.error(res, "Mouvement non trouvé", 404);
    return ResponseApi.success(res, "Mouvement récupéré", 200, movement);
  } catch (error) {
    next(error);
  }
};

// ── DELETE (optionnel) ────────────────────────────────────────────────────────
export const deleteStockMovement = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.stockMovement.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Mouvement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Mouvement non trouvé", 404);
    }
    next(error);
  }
};
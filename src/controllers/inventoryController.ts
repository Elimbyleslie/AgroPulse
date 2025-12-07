import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Inventory } from "../typages/inventory.js";

// CREATE
export const createInventory = async (
  req: Request <{}, {}, Inventory>,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await prisma.inventory.create({
      data: req.body,
      include: { farm: true },
    });
    return ResponseApi.success(res, "Inventory créé", 201, inventory);
  } catch (error) {
    next(error);
  }
};

// GET ALL avec pagination
export const getAllInventories = async (
  req: Request<{}, {}, {}, { farmId?: string; page?: string; limit?: string } >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmId) where.farmId = Number(farmId);

    const inventories = await prisma.inventory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: { farm: true },
    });

    const totalItems = await prisma.inventory.count({ where });

    return ResponseApi.success(res, "Liste des inventaires récupérée", 200, {
      inventories,
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

// GET BY ID
export const getInventoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: Number(req.params.id) },
      include: { farm: true },
    });
    if (!inventory) return ResponseApi.error(res, "Inventory non trouvé", 404);
    return ResponseApi.success(res, "Inventory récupéré", 200, inventory);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateInventory = async (
  req: Request<{ id: string }, {}, Inventory>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.inventory.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { farm: true },
    });
    return ResponseApi.success(res, "Inventory mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Inventory non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteInventory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.inventory.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Inventory supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Inventory non trouvé", 404);
    next(error);
  }
};

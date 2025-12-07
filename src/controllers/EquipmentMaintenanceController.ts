import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createEquipmentMaintenance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const maintenance = await prisma.equipmentMaintenance.create({
      data: req.body,
      include: { farm: true, user: true },
    });
    return ResponseApi.success(res, "Maintenance créée", 201, maintenance);
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllEquipmentMaintenances = async (
  req: Request<{}, {}, {}, { farmId?: string; page?: string; limit?: string }>,
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

    const maintenances = await prisma.equipmentMaintenance.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { farm: true, user: true },
    });
    const totalItems = await prisma.equipmentMaintenance.count({ where });

    return ResponseApi.success(res, "Liste des maintenances récupérée", 200, {
      maintenances,
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
export const getEquipmentMaintenanceById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const maintenance = await prisma.equipmentMaintenance.findUnique({
      where: { id: Number(req.params.id) },
      include: { farm: true, user: true },
    });
    if (!maintenance)
      return ResponseApi.error(res, "Maintenance non trouvée", 404);
    return ResponseApi.success(res, "Maintenance récupérée", 200, maintenance);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateEquipmentMaintenance = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.equipmentMaintenance.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { farm: true, user: true },
    });
    return ResponseApi.success(res, "Maintenance mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Maintenance non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteEquipmentMaintenance = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.equipmentMaintenance.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Maintenance supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Maintenance non trouvée", 404);
    next(error);
  }
};

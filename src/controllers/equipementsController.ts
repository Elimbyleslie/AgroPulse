import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createEquipment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const equipment = await prisma.equipment.create({
      data: req.body,
      include: { farm: true },
    });
    return ResponseApi.success(res, "Équipement créé", 201, equipment);
  } catch (error) { next(error); }
};

// GET ALL
export const getAllEquipments = async (req: Request<{}, {}, {}, { farmId?: string; status?: string; page?: string; limit?: string }>, res: Response, next: NextFunction) => {
  try {
    const { farmId, status } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;

    const equipments = await prisma.equipment.findMany({
      where, skip, take: limit, orderBy: { id: "desc" }, include: { farm: true },
    });
    const totalItems = await prisma.equipment.count({ where });

    return ResponseApi.success(res, "Liste des équipements récupérée", 200, {
      equipments,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) { next(error); }
};

// GET BY ID
export const getEquipmentById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const equipment = await prisma.equipment.findUnique({ where: { id: Number(req.params.id) }, include: { farm: true } });
    if (!equipment) return ResponseApi.error(res, "Équipement non trouvé", 404);
    return ResponseApi.success(res, "Équipement récupéré", 200, equipment);
  } catch (error) { next(error); }
};

// UPDATE
export const updateEquipment = async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.equipment.update({ where: { id: Number(req.params.id) }, data: req.body, include: { farm: true } });
    return ResponseApi.success(res, "Équipement mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Équipement non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteEquipment = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.equipment.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "Équipement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Équipement non trouvé", 404);
    next(error);
  }
};

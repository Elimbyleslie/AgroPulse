import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createFarmTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.farmTask.create({ data: req.body, include: { farm: true, assignedUser: true } });
    return ResponseApi.success(res, "Tâche créée", 201, task);
  } catch (error) { next(error); }
};

// GET ALL
export const getAllFarmTasks = async (req: Request<{}, {}, {}, { farmId?: string; status?: string; page?: string; limit?: string }>, res: Response, next: NextFunction) => {
  try {
    const { farmId, status } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;

    const tasks = await prisma.farmTask.findMany({
      where, skip, take: limit, orderBy: { dueDate: "asc" }, include: { farm: true, assignedUser: true },
    });
    const totalItems = await prisma.farmTask.count({ where });

    return ResponseApi.success(res, "Liste des tâches récupérée", 200, {
      tasks,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) { next(error); }
};

// GET BY ID
export const getFarmTaskById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.farmTask.findUnique({ where: { id: Number(req.params.id) }, include: { farm: true, assignedUser: true } });
    if (!task) return ResponseApi.error(res, "Tâche non trouvée", 404);
    return ResponseApi.success(res, "Tâche récupérée", 200, task);
  } catch (error) { next(error); }
};

// UPDATE
export const updateFarmTask = async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.farmTask.update({ where: { id: Number(req.params.id) }, data: req.body, include: { farm: true, assignedUser: true } });
    return ResponseApi.success(res, "Tâche mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Tâche non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteFarmTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.farmTask.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "Tâche supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Tâche non trouvée", 404);
    next(error);
  }
};

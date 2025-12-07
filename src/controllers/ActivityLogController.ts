import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createActivityLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.activityLog.create({
      data: req.body,
      include: { user: true },
    });
    return ResponseApi.success(res, "ActivityLog créé", 201, log);
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllActivityLogs = async (req: Request<{}, {}, {}, { userId?: string; page?: string; limit?: string }>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = Number(userId);

    const logs = await prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const totalItems = await prisma.activityLog.count({ where });

    return ResponseApi.success(res, "Liste des ActivityLogs récupérée", 200, {
      logs,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getActivityLogById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const log = await prisma.activityLog.findUnique({ where: { id: Number(req.params.id) }, include: { user: true } });
    if (!log) return ResponseApi.error(res, "ActivityLog non trouvé", 404);
    return ResponseApi.success(res, "ActivityLog récupéré", 200, log);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateActivityLog = async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.activityLog.update({ where: { id: Number(req.params.id) }, data: req.body, include: { user: true } });
    return ResponseApi.success(res, "ActivityLog mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "ActivityLog non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteActivityLog = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.activityLog.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "ActivityLog supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "ActivityLog non trouvé", 404);
    next(error);
  }
};

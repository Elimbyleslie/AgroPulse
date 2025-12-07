import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const alert = await prisma.alert.create({
      data: req.body,
      include: { farm: true },
    });
    return ResponseApi.success(res, "Alerte créée", 201, alert);
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllAlerts = async (
  req: Request<
    {},
    {},
    {},
    { farmId?: string; status?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, status } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;

    const alerts = await prisma.alert.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { farm: true },
    });
    const totalItems = await prisma.alert.count({ where });

    return ResponseApi.success(res, "Liste des alertes récupérée", 200, {
      alerts,
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
export const getAlertById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const alert = await prisma.alert.findUnique({
      where: { id: Number(req.params.id) },
      include: { farm: true },
    });
    if (!alert) return ResponseApi.error(res, "Alerte non trouvée", 404);
    return ResponseApi.success(res, "Alerte récupérée", 200, alert);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateAlert = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.alert.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { farm: true },
    });
    return ResponseApi.success(res, "Alerte mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Alerte non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteAlert = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.alert.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Alerte supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Alerte non trouvée", 404);
    next(error);
  }
};

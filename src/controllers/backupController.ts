import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

export const createBackup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const backup = await prisma.backup.create({
      data: req.body,
      include: { organization: true },
    });
    return ResponseApi.success(res, "Backup créé", 201, backup);
  } catch (error) {
    next(error);
  }
};

export const getAllBackups = async (
  req: Request<
    {},
    {},
    {},
    { organizationId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organizationId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (organizationId) where.organizationId = Number(organizationId);

    const backups = await prisma.backup.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { organization: true },
    });
    const totalItems = await prisma.backup.count({ where });

    return ResponseApi.success(res, "Liste des backups récupérée", 200, {
      backups,
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
export const getBackupById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const backup = await prisma.backup.findUnique({
      where: { id: Number(req.params.id) },
      include: { organization: true },
    });
    if (!backup) return ResponseApi.error(res, "Backup non trouvé", 404);
    return ResponseApi.success(res, "Backup récupéré", 200, backup);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateBackup = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.backup.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { organization: true },
    });
    return ResponseApi.success(res, "Backup mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Backup non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteBackup = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.backup.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Backup supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Backup non trouvé", 404);
    next(error);
  }
};

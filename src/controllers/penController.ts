import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

/**
 * Créer un nouveau pen
 */
export const createPen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { barnId, name, capacity } = req.body;

    if (!barnId || !name) {
      return ResponseApi.error(res, "BarnId et nom requis", 400);
    }

    const pen = await prisma.pen.create({
      data: {
        barnId: Number(barnId),
        name,
        capacity: capacity ? Number(capacity) : null,
      },
    });

    ResponseApi.success(res, "Pen créé avec succès", 201, pen);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un pen par son id
 */
export const getPenById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pen = await prisma.pen.findUnique({
      where: { id: Number(id) },
      include: {
        barn: true,
        animalMovementsFrom: true,
        animalMovementsTo: true,
      },
    });

    if (!pen) {
      return ResponseApi.error(res, "Pen non trouvé", 404);
    }

    ResponseApi.success(res, "Pen récupéré avec succès", 200, pen);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les pens (avec pagination et recherche)
 */
export const getAllPens = async (
  req: Request<{}, {}, {}, { search?: string; barnId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, barnId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search };
    }
    if (barnId) {
      where.barnId = Number(barnId);
    }

    const pens = await prisma.pen.findMany({
      where,
      skip: offset,
      take: limit,
      include: { barn: true },
      orderBy: { id: "desc" },
    });

    const totalItems = await prisma.pen.count({ where });
    const totalPages = Math.ceil(totalItems / limit);

    ResponseApi.success(res, "Pens récupérés avec succès", 200, {
      pens,
      pagination: { page, limit, totalItems, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un pen
 */
export const updatePen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const updatedPen = await prisma.pen.update({
      where: { id: Number(id) },
      data: req.body,
    });

    ResponseApi.success(res, "Pen mis à jour avec succès", 200, updatedPen);
  } catch (error: any) {
    if (error.code === "P2025") {
      ResponseApi.error(res, "Pen non trouvé", 404);
    } else {
      next(error);
    }
  }
};

/**
 * Supprimer un pen
 */
export const deletePen = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.pen.delete({
      where: { id: Number(id) },
    });

    ResponseApi.success(res, "Pen supprimé avec succès", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") {
      ResponseApi.error(res, "Pen non trouvé", 404);
    } else {
      next(error);
    }
  }
};

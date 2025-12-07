import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Production } from "../typages/production.js";

// ======================================================
// CREATE Production
// ======================================================
export const createProduction = async (
  req: Request<{}, {}, Production>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      lotId,
      date,
      productType,
      quantity,
      unit,
      qualityGrade,
      notes,
      userId,
      saleItemId,
    } = req.body;

    const production = await prisma.production.create({
      data: {
        lotId,
        date: date ? new Date(date) : undefined,
        productType,
        quantity,
        unit,
        qualityGrade,
        notes,
        userId,
        saleItemId,
      },
    });

    return ResponseApi.success(res, "Production créée avec succès", 201, production);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Productions
// ======================================================
export const getAllProductions = async (
  req: Request<{}, {}, {}, { lotId?: string; productType?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lotId, productType } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (lotId) where.lotId = Number(lotId);
    if (productType) where.productType = { contains: productType, mode: "insensitive" };

    const productions = await prisma.production.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        lot: true,
        user: true,
        saleItem: true,
      },
    });

    const totalItems = await prisma.production.count({ where });

    return ResponseApi.success(res, "Liste des productions récupérée", 200, {
      productions,
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

// ======================================================
// GET Production by ID
// ======================================================
export const getProductionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const production = await prisma.production.findUnique({
      where: { id: Number(id) },
      include: { lot: true, user: true, saleItem: true },
    });

    if (!production) return ResponseApi.error(res, "Production non trouvée", 404);

    return ResponseApi.success(res, "Production récupérée", 200, production);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Production
// ======================================================
export const updateProduction = async (
  req: Request<{ id: string }, {}, Partial<Production>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const updated = await prisma.production.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Production mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Production non trouvée", 404);
    next(error);
  }
};

// ======================================================
// DELETE Production
// ======================================================
export const deleteProduction = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.production.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Production supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Production non trouvée", 404);
    next(error);
  }
};

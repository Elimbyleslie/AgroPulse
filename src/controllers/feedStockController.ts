import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { CreateFeedStockInput, UpdateFeedStockInput } from "../typages/feedStock.js";

export const createFeedStock = async (
  req: Request<{}, {}, CreateFeedStockInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { feedUsages, ...feedStockBody } = req.body;
    const stock = await prisma.feedStock.create({
      // cast to any to avoid TS issues with nested create input shapes from request body
      data: {
        ...feedStockBody,
        totalValue: feedStockBody.totalValue ?? (feedStockBody.quantity * (feedStockBody.unitPrice || 0)),
        ...(feedUsages ? { feedUsages: { create: feedUsages } } : {}),
      } as any,
      include: {
        farm: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    return ResponseApi.success(res, "Stock d'aliment créé avec succès", 201, stock);
  } catch (error) {
    next(error);
  }
};

export const getAllFeedStocks = async (
  req: Request<{}, {}, {}, { farmId?: string; page?: string; limit?: string; status?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, page, limit, status } = req.query;
    const currentPage = Number(page) || 1;
    const take = Number(limit) || 15;
    const skip = (currentPage - 1) * take;

    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;

    const [stocks, totalItems] = await Promise.all([
      prisma.feedStock.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          farm: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.feedStock.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des stocks récupérée", 200, {
      stocks,
      pagination: {
        currentPage,
        previousPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage * take < totalItems ? currentPage + 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedStockById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const stock = await prisma.feedStock.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        farm: true,
        supplier: true,
        feedUsages: true,
        animalFeedings: true,
        feedingPlans: true,
      },
    });

    if (!stock) return ResponseApi.error(res, "Stock non trouvé", 404);

    return ResponseApi.success(res, "Stock récupéré", 200, stock);
  } catch (error) {
    next(error);
  }
};

export const updateFeedStock = async (
  req: Request<{ id: string }, {}, UpdateFeedStockInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.feedStock.update({
      where: { id: Number(req.params.id) },
      data: req.body as any,
      include: {
        farm: true,
        supplier: true,
      },
    });

    return ResponseApi.success(res, "Stock mis à jour avec succès", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Stock non trouvé", 404);
    }
    next(error);
  }
};

export const deleteFeedStock = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.feedStock.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Stock supprimé avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Stock non trouvé", 404);
    }
    next(error);
  }
};
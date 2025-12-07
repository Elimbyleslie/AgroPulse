// CRUD complet avec pagination pour FeedStock
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

export const createFeedStock = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stock = await prisma.feedStock.create({
      data: req.body,
      include: { farm: true },
    });
    return ResponseApi.success(res, "FeedStock créé", 201, stock);
  } catch (error) {
    next(error);
  }
};

export const getAllFeedStocks = async (
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

    const stocks = await prisma.feedStock.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: { farm: true, feedUsages: true, animalFeedings: true },
    });
    const totalItems = await prisma.feedStock.count({ where });

    return ResponseApi.success(res, "Liste des FeedStocks récupérée", 200, {
      stocks,
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

export const getFeedStockById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const stock = await prisma.feedStock.findUnique({
      where: { id: Number(req.params.id) },
      include: { farm: true, feedUsages: true, animalFeedings: true },
    });
    if (!stock) return ResponseApi.error(res, "FeedStock non trouvé", 404);
    return ResponseApi.success(res, "FeedStock récupéré", 200, stock);
  } catch (error) {
    next(error);
  }
};

export const updateFeedStock = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.feedStock.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { farm: true, feedUsages: true, animalFeedings: true },
    });
    return ResponseApi.success(res, "FeedStock mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "FeedStock non trouvé", 404);
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
    return ResponseApi.success(res, "FeedStock supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "FeedStock non trouvé", 404);
    next(error);
  }
};

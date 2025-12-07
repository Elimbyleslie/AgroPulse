import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createFeedUsage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usage = await prisma.feedUsage.create({
      data: req.body,
      include: { lot: true, feedStock: true },
    });
    return ResponseApi.success(res, "FeedUsage créé", 201, usage);
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllFeedUsages = async (
  req: Request<
    {},
    {},
    {},
    { lotId?: string; feedStockId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lotId, feedStockId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (lotId) where.lotId = Number(lotId);
    if (feedStockId) where.feedStockId = Number(feedStockId);

    const usages = await prisma.feedUsage.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { lot: true, feedStock: true },
    });
    const totalItems = await prisma.feedUsage.count({ where });

    return ResponseApi.success(res, "Liste des FeedUsages récupérée", 200, {
      usages,
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
export const getFeedUsageById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const usage = await prisma.feedUsage.findUnique({
      where: { id: Number(req.params.id) },
      include: { lot: true, feedStock: true },
    });
    if (!usage) return ResponseApi.error(res, "FeedUsage non trouvé", 404);
    return ResponseApi.success(res, "FeedUsage récupéré", 200, usage);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateFeedUsage = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.feedUsage.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { lot: true, feedStock: true },
    });
    return ResponseApi.success(res, "FeedUsage mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "FeedUsage non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteFeedUsage = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.feedUsage.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "FeedUsage supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "FeedUsage non trouvé", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createAnimalFeeding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const feeding = await prisma.animalFeeding.create({
      data: req.body,
      include: { animal: true, feedStock: true, user: true, lot: true },
    });
    return ResponseApi.success(res, "AnimalFeeding créé", 201, feeding);
  } catch (error) { next(error); }
};

// GET ALL
export const getAllAnimalFeedings = async (req: Request<{}, {}, {}, { animalId?: string; feedStockId?: string; lotId?: string; page?: string; limit?: string }>, res: Response, next: NextFunction) => {
  try {
    const { animalId, feedStockId, lotId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (animalId) where.animalId = Number(animalId);
    if (feedStockId) where.feedStockId = Number(feedStockId);
    if (lotId) where.lotId = Number(lotId);

    const feedings = await prisma.animalFeeding.findMany({
      where, skip, take: limit, orderBy: { date: "desc" }, include: { animal: true, feedStock: true, user: true, lot: true },
    });
    const totalItems = await prisma.animalFeeding.count({ where });

    return ResponseApi.success(res, "Liste des AnimalFeedings récupérée", 200, {
      feedings,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) { next(error); }
};

// GET BY ID
export const getAnimalFeedingById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const feeding = await prisma.animalFeeding.findUnique({ where: { id: Number(req.params.id) }, include: { animal: true, feedStock: true, user: true, lot: true } });
    if (!feeding) return ResponseApi.error(res, "AnimalFeeding non trouvé", 404);
    return ResponseApi.success(res, "AnimalFeeding récupéré", 200, feeding);
  } catch (error) { next(error); }
};

// UPDATE
export const updateAnimalFeeding = async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.animalFeeding.update({ where: { id: Number(req.params.id) }, data: req.body, include: { animal: true, feedStock: true, user: true, lot: true } });
    return ResponseApi.success(res, "AnimalFeeding mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "AnimalFeeding non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteAnimalFeeding = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.animalFeeding.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "AnimalFeeding supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "AnimalFeeding non trouvé", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalFeeding } from "../typages/animalFeeding.js";


export const createAnimalFeeding = async (
  req: Request<{}, {}, AnimalFeeding>,
  res: Response,
  next: NextFunction
) => {
  try {
    const animalFeeding = await prisma.animalFeeding.create({
      data: req.body,
      include: {
        animal: { select: { id: true, name: true } },
        lot: { select: { id: true, name: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return ResponseApi.success(res, "Distribution alimentaire enregistrée", 201, animalFeeding);
  } catch (error) {
    next(error);
  }
};

// GET ALL - Avec pagination et filtres
export const getAllAnimalFeedings = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId?: string;
      animalId?: string;
      lotId?: string;
      inventoryId?: string;
      startDate?: string;
      endDate?: string;
      userId?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      animalId,
      lotId,
      inventoryId,
      startDate,
      endDate,
      userId,
      page,
      limit,
    } = req.query;

    const currentPage = Number(page) || 1;
    const take = Number(limit) || 15;
    const skip = (currentPage - 1) * take;

    const where: any = {};

    if (farmId) where.animal = { farmId: Number(farmId) };
    if (animalId) where.animalId = Number(animalId);
    if (lotId) where.lotId = Number(lotId);
    if (inventoryId) where.inventoryId = Number(inventoryId);
    if (userId) where.userId = Number(userId);

    // Filtre par date
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [feedings, totalItems] = await Promise.all([
      prisma.animalFeeding.findMany({
        where,
        skip,
        take,
        orderBy: { date: "desc" },
        include: {
          animal: { select: { id: true, name: true } },
          inventory: { select: { id: true, name: true, category: true } },
          lot: { select: { id: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.animalFeeding.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des distributions récupérée", 200, {
      feedings,
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

// GET BY ID
export const getAnimalFeedingById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const feeding = await prisma.animalFeeding.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        animal: true,
        inventory: true,
        lot: true,
        user: true,
      },
    });

    if (!feeding) {
      return ResponseApi.error(res, "Distribution non trouvée", 404);
    }

    return ResponseApi.success(res, "Distribution récupérée", 200, feeding);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateAnimalFeeding = async (
  req: Request<{ id: string }, {}, Partial<AnimalFeeding>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.animalFeeding.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: {
        animal: true,
        inventory: true,
        lot: true,
        user: true,
      },
    });

    return ResponseApi.success(res, "Distribution mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Distribution non trouvée", 404);
    }
    next(error);
  }
};

// DELETE
export const deleteAnimalFeeding = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.animalFeeding.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(res, "Distribution supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Distribution non trouvée", 404);
    }
    next(error);
  }
};
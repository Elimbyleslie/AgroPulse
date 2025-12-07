import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalMovement } from "../typages/animalMovement.js";

// CREATE
export const createAnimalMovement = async (
  req: Request<{}, {}, AnimalMovement>,
  res: Response,
  next: NextFunction
) => {
  try {
    const movement = await prisma.animalMovement.create({ data: req.body });
    return ResponseApi.success(res, "Mouvement enregistré", 201, movement);
  } catch (error) { next(error); }
};

// GET ALL
export const getAllAnimalMovements = async (
  req: Request<{}, {}, {}, { animalId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (animalId) where.animalId = Number(animalId);

    const movements = await prisma.animalMovement.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { date: "desc" },
      include: { animal: true, fromPen: true, toPen: true },
    });

    const totalItems = await prisma.animalMovement.count({ where });

    return ResponseApi.success(res, "Mouvements récupérés", 200, {
      movements,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) { next(error); }
};

// GET BY ID
export const getAnimalMovementById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const movement = await prisma.animalMovement.findUnique({
      where: { id: Number(id) },
      include: { animal: true, fromPen: true, toPen: true },
    });

    if (!movement) return ResponseApi.error(res, "Mouvement non trouvé", 404);

    return ResponseApi.success(res, "Mouvement récupéré", 200, movement);
  } catch (error) { next(error); }
};

// UPDATE
export const updateAnimalMovement = async (
  req: Request<{ id: string }, {}, Partial<AnimalMovement>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updated = await prisma.animalMovement.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return ResponseApi.success(res, "Mouvement mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Mouvement non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteAnimalMovement = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.animalMovement.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, "Mouvement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Mouvement non trouvé", 404);
    next(error);
  }
};

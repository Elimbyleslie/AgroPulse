import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalWeight } from "../typages/animalWeight.js";

// CREATE
export const createAnimalWeight = async (
  req: Request<{}, {}, AnimalWeight>,
  res: Response,
  next: NextFunction
) => {
  try {
    const weight = await prisma.animalWeight.create({ data: req.body });
    return ResponseApi.success(res, "Poids enregistré", 201, weight);
  } catch (error) { next(error); }
};

// GET ALL (pagination + filtre)
export const getAllAnimalWeights = async (
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

    const weights = await prisma.animalWeight.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { date: "desc" },
      include: { animal: true, user: true },
    });

    const totalItems = await prisma.animalWeight.count({ where });

    return ResponseApi.success(res, "Poids récupérés", 200, {
      weights,
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
export const getAnimalWeightById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const weight = await prisma.animalWeight.findUnique({
      where: { id: Number(id) },
      include: { animal: true, user: true },
    });

    if (!weight) return ResponseApi.error(res, "Poids non trouvé", 404);

    return ResponseApi.success(res, "Poids récupéré", 200, weight);
  } catch (error) { next(error); }
};

// UPDATE
export const updateAnimalWeight = async (
  req: Request<{ id: string }, {}, Partial<AnimalWeight>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const updated = await prisma.animalWeight.update({
      where: { id: Number(id) },
      data: req.body,
    });
    return ResponseApi.success(res, "Poids mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Poids non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteAnimalWeight = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const deleted = await prisma.animalWeight.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, "Poids supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Poids non trouvé", 404);
    next(error);
  }
};

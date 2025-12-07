import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalDeath } from "../typages/animalDeath.js";

// ======================================================
// CREATE Animal Death
// ======================================================
export const createAnimalDeath = async (
  req: Request<{}, {}, AnimalDeath>,
  res: Response,
  next: NextFunction
) => {
  try {
    const death = await prisma.animalDeath.create({ data: req.body });
    return ResponseApi.success(res, "Décès enregistré", 201, death);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Animal Deaths (pagination + filtre)
// ======================================================
export const getAllAnimalDeaths = async (
  req: Request<{}, {}, {}, { animalId?: string; lotId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId, lotId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (animalId) where.animalId = Number(animalId);
    if (lotId) where.lotId = Number(lotId);

    const deaths = await prisma.animalDeath.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { dateOfDeath: "desc" },
      include: { animal: true, lot: true, recorder: true },
    });

    const totalItems = await prisma.animalDeath.count({ where });

    return ResponseApi.success(res, "Décès récupérés", 200, {
      deaths,
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
// GET Animal Death by ID
// ======================================================
export const getAnimalDeathById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const death = await prisma.animalDeath.findUnique({
      where: { id: Number(id) },
      include: { animal: true, lot: true, recorder: true },
    });

    if (!death) return ResponseApi.error(res, "Décès non trouvé", 404);

    return ResponseApi.success(res, "Décès récupéré", 200, death);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Animal Death
// ======================================================
export const updateAnimalDeath = async (
  req: Request<{ id: string }, {}, Partial<AnimalDeath>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updated = await prisma.animalDeath.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Décès mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Décès non trouvé", 404);
    next(error);
  }
};

// ======================================================
// DELETE Animal Death
// ======================================================
export const deleteAnimalDeath = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.animalDeath.delete({ where: { id: Number(id) } });

    return ResponseApi.success(res, "Décès supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Décès non trouvé", 404);
    next(error);
  }
};

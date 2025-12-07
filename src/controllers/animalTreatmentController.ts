import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalTreatment } from "../typages/animalTreatement.js";

// ======================================================
// CREATE
// ======================================================
export const createAnimalTreatment = async (
  req: Request<{}, {}, AnimalTreatment>,
  res: Response,
  next: NextFunction
) => {
  try {
    const treatment = await prisma.animalTreatment.create({
      data: req.body,
    });

    return ResponseApi.success(res, "Traitement créé", 201, treatment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL + filtres + pagination
// ======================================================
export const getAllAnimalTreatments = async (
  req: Request<
    {},
    {},
    {},
    { animalId?: string; lotId?: string; page?: string; limit?: string }
  >,
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

    const treatments = await prisma.animalTreatment.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { startDate: "desc" },
      include: {
        animal: true,
        lot: true,
        admin: true, // nom de la relation du modèle
      },
    });

    const totalItems = await prisma.animalTreatment.count({ where });

    return ResponseApi.success(res, "Traitements récupérés", 200, {
      treatments,
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
// GET BY ID
// ======================================================
export const getAnimalTreatmentById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const treatment = await prisma.animalTreatment.findUnique({
      where: { id: Number(id) },
      include: {
        animal: true,
        lot: true,
        admin: true,
      },
    });

    if (!treatment) {
      return ResponseApi.error(res, "Traitement non trouvé", 404);
    }

    return ResponseApi.success(res, "Traitement récupéré", 200, treatment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE
// ======================================================
export const updateAnimalTreatment = async (
  req: Request<{ id: string }, {}, Partial<AnimalTreatment>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updated = await prisma.animalTreatment.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Traitement mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Traitement non trouvé", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE
// ======================================================
export const deleteAnimalTreatment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.animalTreatment.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Traitement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Traitement non trouvé", 404);
    }
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalVaccination } from "../typages/animalVaccination.js";


// ======================================================
// CREATE
// ======================================================
export const createAnimalVaccination = async (
  req: Request<{}, {}, AnimalVaccination>,
  res: Response,
  next: NextFunction
) => {
  try {
    const vaccination = await prisma.animalVaccination.create({
      data: req.body,
    });

    return ResponseApi.success(res, "Vaccination créée", 201, vaccination);
  } catch (error) {
    next(error);
  }
};


// ======================================================
// GET ALL + filtres + pagination
// ======================================================
export const getAllAnimalVaccinations = async (
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

    const vaccinations = await prisma.animalVaccination.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { dateGiven: "desc" },
      include: {
        animal: true,
        lot: true,
        admin: true,
      },
    });

    const totalItems = await prisma.animalVaccination.count({ where });

    return ResponseApi.success(res, "Liste des vaccinations", 200, {
      vaccinations,
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
export const getAnimalVaccinationById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const vaccination = await prisma.animalVaccination.findUnique({
      where: { id: Number(id) },
      include: {
        animal: true,
        lot: true,
        admin: true,
      },
    });

    if (!vaccination) {
      return ResponseApi.error(res, "Vaccination non trouvée", 404);
    }

    return ResponseApi.success(res, "Vaccination récupérée", 200, vaccination);
  } catch (error) {
    next(error);
  }
};


// ======================================================
// UPDATE
// ======================================================
export const updateAnimalVaccination = async (
  req: Request<{ id: string }, {}, Partial<AnimalVaccination>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updated = await prisma.animalVaccination.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Vaccination mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Vaccination non trouvée", 404);
    }
    next(error);
  }
};


// ======================================================
// DELETE
// ======================================================
export const deleteAnimalVaccination = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.animalVaccination.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Vaccination supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Vaccination non trouvée", 404);
    }
    next(error);
  }
};

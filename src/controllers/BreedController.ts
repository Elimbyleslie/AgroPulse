import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Breed } from "../typages/breed.js";

// ======================================================
// CREATE Breed
// ======================================================
export const createBreed = async (
  req: Request<{}, {}, Breed>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { speciesId, name } = req.body;

    if (!speciesId || !name) {
      return ResponseApi.error(res, "speciesId et name sont obligatoires", 400);
    }

    const breed = await prisma.breed.create({
      data: { speciesId, name },
    });

    return ResponseApi.success(res, "Race créée avec succès", 201, breed);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Breeds (pagination + filtre par species)
// ======================================================
export const getAllBreeds = async (
  req: Request<{}, {}, {}, { search?: string; speciesId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, speciesId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (speciesId) {
      where.speciesId = Number(speciesId);
    }

    const breeds = await prisma.breed.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { id: "desc" },
      include: {
        species: true,
        animals: true,
        lots: true,
      },
    });

    const totalItems = await prisma.breed.count({ where });

    return ResponseApi.success(res, "Liste des races récupérée", 200, {
      breeds,
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
// GET Breed by ID
// ======================================================
export const getBreedById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const breed = await prisma.breed.findUnique({
      where: { id: Number(id) },
      include: {
        species: true,
        animals: true,
        lots: true,
      },
    });

    if (!breed) {
      return ResponseApi.error(res, "Race non trouvée", 404);
    }

    return ResponseApi.success(res, "Race récupérée", 200, breed);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Breed
// ======================================================
export const updateBreed = async (
  req: Request<{ id: string }, {}, Partial<Breed>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const updated = await prisma.breed.update({
      where: { id: Number(id) },
      data,
    });

    return ResponseApi.success(res, "Race mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Race non trouvée", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Breed
// ======================================================
export const deleteBreed = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.breed.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Race supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Race non trouvée", 404);
    }
    next(error);
  }
};

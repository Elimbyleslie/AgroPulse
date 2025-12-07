import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Species } from "../typages/species.js";

// ======================================================
// CREATE Species
// ======================================================
export const createSpecies = async (
  req: Request<{}, {}, Species>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, name } = req.body;

    if (!name) {
      return ResponseApi.error(res, "Le nom est obligatoire", 400);
    }

    const species = await prisma.species.create({
      data: { code, name },
    });

    return ResponseApi.success(res, "Espèce créée avec succès", 201, species);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Species (pagination + filtre)
// ======================================================
export const getAllSpecies = async (
  req: Request<{}, {}, {}, { search?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const speciesList = await prisma.species.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { name: "asc" },
      include: { breeds: true, herds: true, lots: true, animals: true },
    });

    const totalItems = await prisma.species.count({ where });

    return ResponseApi.success(res, "Liste des espèces récupérée", 200, {
      species: speciesList,
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
// GET Species by ID
// ======================================================
export const getSpeciesById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const species = await prisma.species.findUnique({
      where: { id: Number(id) },
      include: { breeds: true, herds: true, lots: true, animals: true },
    });

    if (!species) {
      return ResponseApi.error(res, "Espèce non trouvée", 404);
    }

    return ResponseApi.success(res, "Espèce récupérée", 200, species);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Species
// ======================================================
export const updateSpecies = async (
  req: Request<{ id: string }, {}, Partial<Species>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const { id: _, ...body } = req.body;

    const updateData: any = {
      code: body.code,
      name: body.name,
    };
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    const updated = await prisma.species.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return ResponseApi.success(res, "Espèce mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Espèce non trouvée", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Species
// ======================================================
export const deleteSpecies = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.species.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Espèce supprimée avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Espèce non trouvée", 404);
    }
    next(error);
  }
};

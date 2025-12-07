import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalReproduction } from "../typages/animalReproduction.js";

// ======================================================
// CREATE AnimalReproduction
// ======================================================
export const createAnimalReproduction = async (
  req: Request<{}, {}, AnimalReproduction>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      femaleId,
      maleId,
      matingDate,
      expectedBirth,
      actualBirthDate,
      numberBorn,
      notes,
    } = req.body;

    const reproduction = await prisma.animalReproduction.create({
      data: {
        femaleId,
        maleId,
        matingDate,
        expectedBirth,
        actualBirthDate,
        numberBorn,
        notes,
      },
    });

    return ResponseApi.success(
      res,
      "Reproduction animale créée avec succès",
      201,
      reproduction
    );
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL AnimalReproductions
// ======================================================
export const getAllAnimalReproductions = async (
  req: Request<{}, {}, {}, { femaleId?: string; maleId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { femaleId, maleId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (femaleId) where.femaleId = Number(femaleId);
    if (maleId) where.maleId = Number(maleId);

    const reproductions = await prisma.animalReproduction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        female: true,
        male: true,
      },
    });

    const totalItems = await prisma.animalReproduction.count({ where });

    return ResponseApi.success(res, "Liste des reproductions récupérée", 200, {
      reproductions,
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
// GET AnimalReproduction by ID
// ======================================================
export const getAnimalReproductionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const reproduction = await prisma.animalReproduction.findUnique({
      where: { id: Number(id) },
      include: { female: true, male: true },
    });

    if (!reproduction) return ResponseApi.error(res, "Reproduction non trouvée", 404);

    return ResponseApi.success(res, "Reproduction récupérée", 200, reproduction);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE AnimalReproduction
// ======================================================
export const updateAnimalReproduction = async (
  req: Request<{ id: string }, {}, Partial<AnimalReproduction>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const updated = await prisma.animalReproduction.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Reproduction mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Reproduction non trouvée", 404);
    next(error);
  }
};

// ======================================================
// DELETE AnimalReproduction
// ======================================================
export const deleteAnimalReproduction = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.animalReproduction.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Reproduction supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Reproduction non trouvée", 404);
    next(error);
  }
};

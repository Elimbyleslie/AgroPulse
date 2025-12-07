import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalHealthRecord } from "../typages/animalHealthRecords.js";

// ======================================================
// CREATE Health Record
// ======================================================
export const createAnimalHealthRecord = async (
  req: Request<{}, {}, AnimalHealthRecord>,
  res: Response,
  next: NextFunction
) => {
  try {
    const record = await prisma.animalHealthRecord.create({
      data: req.body,
    });

    return ResponseApi.success(res, "Fiche de santé créée", 201, record);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Health Records (pagination + filtre)
// ======================================================
export const getAllAnimalHealthRecords = async (
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

    const records = await prisma.animalHealthRecord.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { checkDate: "desc" },
      include: { animal: true, lot: true, veterinarian: true },
    });

    const totalItems = await prisma.animalHealthRecord.count({ where });

    return ResponseApi.success(res, "Fiches de santé récupérées", 200, {
      records,
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
// GET Health Record by ID
// ======================================================
export const getAnimalHealthRecordById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const record = await prisma.animalHealthRecord.findUnique({
      where: { id: Number(id) },
      include: { animal: true, lot: true, veterinarian: true },
    });

    if (!record) {
      return ResponseApi.error(res, "Fiche de santé non trouvée", 404);
    }

    return ResponseApi.success(res, "Fiche de santé récupérée", 200, record);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Health Record
// ======================================================
export const updateAnimalHealthRecord = async (
  req: Request<{ id: string }, {}, Partial<AnimalHealthRecord>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updated = await prisma.animalHealthRecord.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Fiche de santé mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Fiche de santé non trouvée", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Health Record
// ======================================================
export const deleteAnimalHealthRecord = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.animalHealthRecord.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Fiche de santé supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Fiche de santé non trouvée", 404);
    }
    next(error);
  }
};

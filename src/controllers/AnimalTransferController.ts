import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalTransfer } from "../typages/animalTransfer.js";

// ======================================================
// CREATE Animal Transfer
// ======================================================
export const createAnimalTransfer = async (
  req: Request<{}, {}, AnimalTransfer>,
  res: Response,
  next: NextFunction
) => {
  try {
    const transfer = await prisma.animalTransfer.create({ data: req.body });
    return ResponseApi.success(res, "Transfert enregistré", 201, transfer);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Animal Transfers (pagination + filtre)
// ======================================================
export const getAllAnimalTransfers = async (
  req: Request<{}, {}, {}, { animalId?: string; fromLotId?: string; toLotId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId, fromLotId, toLotId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (animalId) where.animalId = Number(animalId);
    if (fromLotId) where.fromLotId = Number(fromLotId);
    if (toLotId) where.toLotId = Number(toLotId);

    const transfers = await prisma.animalTransfer.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { date: "desc" },
      include: { animal: true, fromLot: true, toLot: true, user: true },
    });

    const totalItems = await prisma.animalTransfer.count({ where });

    return ResponseApi.success(res, "Transferts récupérés", 200, {
      transfers,
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
// GET Animal Transfer by ID
// ======================================================
export const getAnimalTransferById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const transfer = await prisma.animalTransfer.findUnique({
      where: { id: Number(id) },
      include: { animal: true, fromLot: true, toLot: true, user: true },
    });

    if (!transfer) return ResponseApi.error(res, "Transfert non trouvé", 404);

    return ResponseApi.success(res, "Transfert récupéré", 200, transfer);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Animal Transfer
// ======================================================
export const updateAnimalTransfer = async (
  req: Request<{ id: string }, {}, Partial<AnimalTransfer>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updated = await prisma.animalTransfer.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Transfert mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Transfert non trouvé", 404);
    next(error);
  }
};

// ======================================================
// DELETE Animal Transfer
// ======================================================
export const deleteAnimalTransfer = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.animalTransfer.delete({ where: { id: Number(id) } });

    return ResponseApi.success(res, "Transfert supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Transfert non trouvé", 404);
    next(error);
  }
};

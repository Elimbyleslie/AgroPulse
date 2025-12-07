import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Lot } from "../typages/lot.js";

// ======================================================
// CREATE Lot
// ======================================================
export const createLot = async (
  req: Request<{}, {}, Lot>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, name, herdId, barnId, speciesId, breedId, ageGroup, quantity, entryDate, status, photo } = req.body;

    if (!farmId || !name) {
      return ResponseApi.error(res, "farmId et name sont obligatoires", 400);
    }

    const lot = await prisma.lot.create({
      data: {
        farmId,
        name,
        herdId,
        barnId,
        speciesId,
        breedId,
        ageGroup,
        quantity,
        entryDate: entryDate ? new Date(entryDate) : undefined,
        status,
        photo
      },
    });

    return ResponseApi.success(res, "Lot créé avec succès", 201, lot);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Lots (pagination + filtre)
// ======================================================
export const getAllLots = async (
  req: Request<{}, {}, {}, { search?: string; farmId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, farmId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (farmId) {
      where.farmId = Number(farmId);
    }

    const lots = await prisma.lot.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { entryDate: "desc" },
      include: { farm: true, herd: true, barn: true, species: true, breed: true },
    });

    const totalItems = await prisma.lot.count({ where });

    return ResponseApi.success(res, "Liste des lots récupérée", 200, {
      lots,
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
// GET Lot by ID
// ======================================================
export const getLotById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const lot = await prisma.lot.findUnique({
      where: { id: Number(id) },
      include: { farm: true, herd: true, barn: true, species: true, breed: true },
    });

    if (!lot) return ResponseApi.error(res, "Lot non trouvé", 404);

    return ResponseApi.success(res, "Lot récupéré", 200, lot);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Lot
// ======================================================
export const updateLot = async (
  req: Request<{ id: string }, {}, Partial<Lot>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    // On ignore le champ id dans la mise à jour
    const { id: _, ...updateData } = req.body;

    const updated = await prisma.lot.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return ResponseApi.success(res, "Lot mis à jour", 200, updated);
  } catch (error: any) {
    // Gestion de l'erreur si l'élément n'existe pas
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Lot non trouvé", 404);
    }
    next(error);
  }
};


// ======================================================
// DELETE Lot
// ======================================================
export const deleteLot = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.lot.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, "Lot supprimé avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Lot non trouvé", 404);
    }
    next(error);
  }
};

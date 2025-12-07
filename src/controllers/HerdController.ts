import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Herd } from "../typages/herd.js";

// ======================================================
// CREATE Herd
// ======================================================
export const createHerd = async (
  req: Request<{}, {}, Herd>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, speciesId, name, photo } = req.body;

    if (!farmId || !speciesId || !name) {
      return ResponseApi.error(res, "farmId, speciesId et name sont obligatoires", 400);
    }

    const herd = await prisma.herd.create({
      data: { farmId, speciesId, name, photo },
    });

    return ResponseApi.success(res, "Herd créée avec succès", 201, herd);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Herds
// ======================================================
export const getAllHerds = async (
  req: Request<{}, {}, {}, { search?: string; farmId?: string; speciesId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, farmId, speciesId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (farmId) where.farmId = Number(farmId);
    if (speciesId) where.speciesId = Number(speciesId);

    const herds = await prisma.herd.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
      include: { lots: true, species: true, farm: true },
    });

    const totalItems = await prisma.herd.count({ where });

    return ResponseApi.success(res, "Liste des Herds récupérée", 200, {
      herds,
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
// GET Herd by ID
// ======================================================
export const getHerdById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const herd = await prisma.herd.findUnique({
      where: { id: Number(id) },
      include: { lots: true, species: true, farm: true },
    });

    if (!herd) return ResponseApi.error(res, "Herd non trouvée", 404);

    return ResponseApi.success(res, "Herd récupérée", 200, herd);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Herd
// ======================================================
export const updateHerd = async (
  req: Request<{ id: string }, {}, Partial<Herd>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const { id: _, ...body } = req.body;

    const updateData: any = { ...body };
    Object.keys(updateData).forEach(
      key => updateData[key] === undefined && delete updateData[key]
    );

    const updated = await prisma.herd.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return ResponseApi.success(res, "Herd mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Herd non trouvée", 404);
    next(error);
  }
};

// ======================================================
// DELETE Herd
// ======================================================
export const deleteHerd = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.herd.delete({ where: { id: Number(id) } });

    return ResponseApi.success(res, "Herd supprimée avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Herd non trouvée", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Birth } from "../typages/birth.js";

// ======================================================
// CREATE Birth
// ======================================================
export const createBirth = async (
  req: Request<{}, {}, Birth>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      lotId,
      motherId,
      fatherId,
      photo,
      date,
      numberBorn,
      numberAlive,
      numberDead,
      notes,
      userId,
    } = req.body;

    if (!farmId || !motherId || !date) {
      return ResponseApi.error(
        res,
        "farmId, motherId et date sont obligatoires",
        400
      );
    }

    const birth = await prisma.birth.create({
      data: {
        farmId,
        lotId,
        motherId,
        fatherId,
        photo,
        date,
        numberBorn,
        numberAlive,
        numberDead,
        notes,
        userId,
      },
    });

    return ResponseApi.success(res, "Naissance créée avec succès", 201, birth);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Births (pagination + filters)
// ======================================================
export const getAllBirths = async (
  req: Request<
    {},
    {},
    {},
    { search?: string; farmId?: string; motherId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, motherId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (farmId) where.farmId = Number(farmId);
    if (motherId) where.motherId = Number(motherId);

    const births = await prisma.birth.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        farm: true,
        mother: true,
        father: true,
        lot: true,
        user: true,
        newborns: true,
      },
    });

    const totalItems = await prisma.birth.count({ where });

    return ResponseApi.success(res, "Liste des naissances récupérée", 200, {
      births,
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
// GET Birth by ID
// ======================================================
export const getBirthById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const birth = await prisma.birth.findUnique({
      where: { id: Number(id) },
      include: {
        farm: true,
        mother: true,
        father: true,
        lot: true,
        user: true,
        newborns: true,
      },
    });

    if (!birth) {
      return ResponseApi.error(res, "Naissance non trouvée", 404);
    }

    return ResponseApi.success(res, "Naissance récupérée", 200, birth);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Birth
// ======================================================
export const updateBirth = async (
  req: Request<{ id: string }, {}, Partial<Birth>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const updated = await prisma.birth.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Naissance mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Naissance non trouvée", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Birth
// ======================================================
export const deleteBirth = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.birth.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Naissance supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Naissance non trouvée", 404);
    }
    next(error);
  }
};

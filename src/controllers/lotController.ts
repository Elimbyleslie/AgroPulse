import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Lot } from "../typages/lot.js";

// ======================================================
// CREATE Lot
// ======================================================
export const createLot = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmId = Number(req.body.farmId);
    const name = req.body.name;
    const entryDate = req.body.entryDate;

    // 1. Validations de base
    if (!farmId || isNaN(farmId)) {
      return ResponseApi.error(res, "farmId est obligatoire", 400);
    }
    if (!name) {
      return ResponseApi.error(res, "Le nom du lot est obligatoire", 400);
    }
    if (!entryDate) {
      return ResponseApi.error(res, "La date d'entrée est obligatoire", 400);
    }
    const photoPath = req.file ? `/uploads/lots/${req.file.filename}` : null;

    // 3. Logique de création Prisma
    const lot = await prisma.lot.create({
      data: {
        farmId,
        name,
        barnId: req.body.barnId ? Number(req.body.barnId) : null,
        speciesId: req.body.speciesId ? Number(req.body.speciesId) : null,
        breedId: req.body.breedId ? Number(req.body.breedId) : null,
        quantity: Number(req.body.quantity) || 0,
        entryDate: new Date(entryDate),
        status: req.body.status || "active",
        ageGroup: req.body.ageGroup,
        photo: photoPath, // Sera soit le chemin, soit null
      },
      include: {
        farm: true,
        barn: true,
        species: true,
        breed: true,
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
  req: Request<
    {},
    {},
    {}, 
    { 
      search?: string; 
      farmId?: string; 
      barnId?: string; // ✅ AJOUTÉ pour filtrer par barn
      penId?: string;  // ✅ AJOUTÉ pour filtrer par pen
      page?: string; 
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, farmId, barnId, penId } = req.query;
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
    if (barnId) {
      where.barnId = Number(barnId); // ✅ AJOUTÉ
    }
    if (penId) {
      where.penId = Number(penId); // ✅ AJOUTÉ
    }

    const lots = await prisma.lot.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { entryDate: "desc" },
      include: {
        farm: true,
        herd: true,
        barn: true,
        pen: true, // ✅ AJOUTÉ
        species: true,
        breed: true,
        _count: { // ✅ Utile pour avoir le nombre d'animaux
          select: { animals: true }
        }
      },
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
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const lot = await prisma.lot.findUnique({
      where: { id: Number(id) },
      include: {
        farm: true,
        herd: true,
        barn: true,
        pen: true, // ✅ AJOUTÉ
        species: true,
        breed: true,
        animals: { // ✅ Inclure les animaux du lot
          select: {
            id: true,
            name: true,
            status: true,
            photo: true,
          }
        },
        _count: {
          select: {
            animals: true,
            healthRecords: true,
            vaccinations: true,
          }
        }
      },
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
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const { id: _, penId, barnId, ...updateData } = req.body;

    // ✅ Validation: Si penId est modifié, vérifier cohérence avec barnId
    if (penId !== undefined) {
      if (penId && barnId) {
        const pen = await prisma.pen.findUnique({
          where: { id: Number(penId) },
        });
        
        if (!pen) {
          return ResponseApi.error(res, "Pen introuvable", 404);
        }
        
        if (pen.barnId !== Number(barnId)) {
          return ResponseApi.error(res, "Le pen n'appartient pas au barn spécifié", 400);
        }
      }
      
      // Ajouter penId aux données de mise à jour
      (updateData as any).penId = penId ? Number(penId) : null;
    }

    if (barnId !== undefined) {
      (updateData as any).barnId = barnId ? Number(barnId) : null;
    }

    const updated = await prisma.lot.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        farm: true,
        herd: true,
        barn: true,
        pen: true, // ✅ AJOUTÉ
        species: true,
        breed: true,
      },
    });

    return ResponseApi.success(res, "Lot mis à jour", 200, updated);
  } catch (error: any) {
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
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    // ✅ Vérifier s'il y a des animaux dans le lot
    const lot = await prisma.lot.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { animals: true } } },
    });

    if (!lot) {
      return ResponseApi.error(res, "Lot non trouvé", 404);
    }

    if (lot._count.animals > 0) {
      return ResponseApi.error(
        res, 
        `Impossible de supprimer le lot. Il contient ${lot._count.animals} animal(aux).`,
        400
      );
    }

    const deleted = await prisma.lot.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, "Lot supprimé avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Lot non trouvé", 404);
    }
    next(error);
  }
};
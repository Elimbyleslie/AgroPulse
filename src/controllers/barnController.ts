import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Barn } from "../typages/barn.js";

// ======================================================
//  CREATE Barn
// ======================================================
export const createBarn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extraire les données du corps de la requête
    // Note : avec Multer, les champs texte sont dans req.body
    const farmId = Number(req.body.farmId);
    const name = req.body.name;
    const capacity = req.body.capacity ? Number(req.body.capacity) : null;

    // 2. Validation des champs obligatoires
    if (!farmId || isNaN(farmId)) {
      return ResponseApi.error(res, "L'ID de la ferme est obligatoire", 400);
    }
    if (!name) {
      return ResponseApi.error(res, "Le nom du bâtiment est obligatoire", 400);
    }

    // 3. Vérifier si le bâtiment existe déjà dans cette ferme
    const existingBarn = await prisma.barn.findFirst({
      where: { farmId, name },
    });

    if (existingBarn) {
      return ResponseApi.error(res, "Un bâtiment avec ce nom existe déjà dans cette ferme", 400);
    }
    // 4. Gestion de la photo (si fournie)
    const photoPath = req.file ? `/uploads/barns/${req.file.filename}` : null;

    // 5. Création dans la base de données avec Prisma
    const barn = await prisma.barn.create({
      data: { 
        farmId, 
        name, 
        capacity, 
        photo: photoPath // ✅ Enregistrement du chemin de l'image
      },
    });

    return ResponseApi.success(res, "Bâtiment créé avec succès", 201, barn);
  } catch (error) {
    next(error);
  }
};
// ======================================================
//  GET ALL Barns (avec pagination + filtre)
// ======================================================
export const getAllBarns = async (
  req: Request<
    {},
    {},
    {},
    { search?: string; farmId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction,
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

    const barns = await prisma.barn.findMany({
      skip: offset,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
      include: {
        farm: true,
        pens: true,
        lots: true,
      },
    });

    const totalItems = await prisma.barn.count({ where });

    return ResponseApi.success(res, "Liste des étables récupérée", 200, {
      barns,
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
//  GET Barn by ID
// ======================================================
export const getBarnById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const barn = await prisma.barn.findUnique({
      where: { id: Number(id) },
      include: {
        farm: true,
        pens: true,
        lots: true,
      },
    });

    if (!barn) {
      return ResponseApi.error(res, "Étable non trouvée", 404);
    }

    return ResponseApi.success(res, "Étable récupérée", 200, barn);
  } catch (error) {
    next(error);
  }
};

// ======================================================
//  UPDATE Barn
// ======================================================
export const updateBarn = async (
  req: Request<
    { id: string },
    {},
    Partial<{ name: string; capacity: number; photo: string }>
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const updated = await prisma.barn.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Étable mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Étable non trouvée", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Barn
// ======================================================
export const deleteBarn = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.barn.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(
      res,
      "Étable supprimée avec succès",
      200,
      deleted,
    );
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Étable non trouvée", 404);
    }
    next(error);
  }
};

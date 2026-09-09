import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Herd } from "../typages/herd.js";

// ======================================================
// CREATE Herd
// ======================================================
export const createHerd = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Extraction
    const farmId = Number(req.body.farmId);
    const speciesId = Number(req.body.speciesId);
    const name = req.body.name?.trim();
    const barnId = Number(req.body.barnId);

    // 2. Validation stricte
    if (!farmId || isNaN(farmId)) {
      return ResponseApi.error(res, "farmId est obligatoire et doit être un nombre", 400);
    }

    if (!speciesId || isNaN(speciesId)) {
      return ResponseApi.error(res, "speciesId est obligatoire et doit être un nombre", 400);
    }

    if (!name) {
      return ResponseApi.error(res, "Le nom du troupeau est obligatoire", 400);
    }

    // barnId est obligatoire selon ton schéma
    if (!req.body.barnId || isNaN(barnId)) {
      return ResponseApi.error(
        res,
        "barnId est obligatoire. Veuillez sélectionner un bâtiment.",
        400,
      );
    }

    // 3. Vérification du nom unique dans la ferme
    const existingHerd = await prisma.herd.findFirst({
      where: {
        farmId,
        name,
      },
    });

    if (existingHerd) {
      return ResponseApi.error(
        res,
        `Un troupeau nommé "${name}" existe déjà dans cette ferme.`,
        400,
      );
    }

    // 4. Gestion de l'image
    const photoPath = req.file ? `/uploads/herds/${req.file.filename}` : null;

    // 5. Création
    const herd = await prisma.herd.create({
      data: {
        farmId,
        speciesId,
        name,
        photo: photoPath,
        barnId, // maintenant garanti d'être un nombre valide
      },
      include: {
        species: true,
      },
    });

    return ResponseApi.success(res, "Troupeau créé avec succès", 201, herd);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Herds
// ======================================================
export const getAllHerds = async (
  req: Request<
    {},
    {},
    {},
    {
      search?: string;
      farmId?: string;
      speciesId?: string;
      page?: string;
      limit?: string;
      barnId?:string 
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { search, farmId, speciesId, barnId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (farmId) where.farmId = Number(farmId);
    if (speciesId) where.speciesId = Number(speciesId);
    if(barnId) where.barnId = Number(barnId)

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
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

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
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const { id: _, ...body } = req.body;

    const updateData: any = { ...body };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updated = await prisma.herd.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return ResponseApi.success(res, "Herd mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Herd non trouvée", 404);
    next(error);
  }
};

// ======================================================
// DELETE Herd
// ======================================================
export const deleteHerd = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.herd.delete({ where: { id: Number(id) } });

    return ResponseApi.success(res, "Herd supprimée avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Herd non trouvée", 404);
    next(error);
  }
};

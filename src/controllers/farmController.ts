import { NextFunction, Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import { Farm } from "../typages/farm.js";
import ResponseApi from "../helpers/response.js";
import Utilities from "../helpers/utilities.js";
import fs from "fs/promises";
import path from "path";
// Creation d'une ferme

export const createFarm = async (
  req: Request < any, any, Farm > ,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    // Gérer l'upload de la photo si présente
    let photoPath = '';
    if (req.files?.photo) {
      photoPath = await Utilities.saveFile(req.files.photo as any, 'uploads/farms');
      photoPath = Utilities.resolveFileUrl(req, photoPath);
    }
// Vérifier l'unicité du nom de la ferme
    await prisma.farm.findFirst({where:{name:data.name}}).then(async(existingFarm)=>{
    if(existingFarm){
      ResponseApi.error(res, "une ferme avec ce nom existe deja.", 400);
      return;
    }
    });
    // Vérifier que l'organisation existe
    if (!(await prisma.organization.findUnique({ where: { id: Number(data.organizationId) } }))) {
      return ResponseApi.error(res, " cette  organisation n'existe pas", 400);
    }


    const farm = await prisma.farm.create({
      data: {
        name: data.name,
        organizationId: data.organizationId,
        area: data.area,
        location: data.location,
        photo: photoPath,
        areaUnit: data.areaUnit,
        latitude: data.latitude,
        longitude: data.longitude,
        
      },
    });

    ResponseApi.success(res, "Votre ferme a été créée avec succès", 201, farm);
  } catch (error: any) {
    if (error.code === "P2002") {
      ResponseApi.error(res, "Une ferme existe déjà avec ce nom, veuillez choisir un autre nom", 409);
    } else {
      next(error);
    }
  }
};


// Recuperation de toutes les fermes

export const getAllFarm = async (
  req: Request<
    {},
    {},
    {},
    {
      search?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search, startDate, endDate } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // --- Construction dynamique du filtre ---
    const where: any = {};

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // --- Fetch des données ---
    const farms = await prisma.farm.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      where,
    });

    const totalItems = await prisma.farm.count({ where });

    // --- Calcul Pagination ---
    const totalPage = Math.ceil(totalItems / limit);

    return ResponseApi.success(res, "Fermes récupérées avec succès", 200, {
      farms,
      pagination: {
        limit,
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPage ? page + 1 : null,
        totalPage,
        totalItems,
      },
    });
  } catch (error) {
    ResponseApi.error(
      res,
      "Impossible de récupérer la liste des fermes",
      422
    );
    next(error);
  }
};


// recuperer une ferme par identifiant

export const getFarmById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Vérification de l'id
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide ou manquant", 400);
    }

    // Récupération de la ferme
    const farm = await prisma.farm.findUnique({
      where: { id: Number(id) },
    });

    // Si aucune ferme trouvée
    if (!farm) {
      return ResponseApi.error(res, "Ferme non trouvée", 404);
    }

    // Succès
    return ResponseApi.success(res, "Ferme trouvée avec succès", 200, farm);

  } catch (error) {
    next(error);
  }
};
 export const getFarmByIdAndRelations = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Vérification de l'ID
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide ou manquant", 400);
    }

    // Récupération de la ferme + toutes relations
    const farm = await prisma.farm.findUnique({
      where: { id: Number(id) },
      include: {
        organization: true,
        barns: true,
        herds: true,
        lots: true,
        animals: true,
        feedStock: true,
        purchases: true,
        expenses: true,
        sales: true,
        inventory: true,
        farmTasks: true,
        alerts: true,
        reports: true,
        financialReports: true,
        equipmentMaintenances: true,
        users: true, // relation "DefaultFarm"
        audit: true,
        births: true,
        equipments: true,
      },
    });

    // Si aucune ferme trouvée
    if (!farm) {
      return ResponseApi.error(res, "Ferme non trouvée", 404);
    }

    // Réponse
    return ResponseApi.success(
      res,
      "Ferme récupérée avec succès",
      200,
      farm
    );

  } catch (error) {
    next(error);
  }
};

// mettre à jour une ferme
export const updateFarm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (!id) {
      return ResponseApi.error(res, "Id non existant", 400);
    }

    // Récupérer la ferme existante
    const existingFarm = await prisma.farm.findUnique({
      where: { id: Number(id) },
    });

    if (!existingFarm) {
      return ResponseApi.error(res, "Ferme non trouvée", 404);
    }

    const data: any = { ...req.body };

    // Gérer l'upload de nouvelle photo
    if (req.files?.photo) {
      // Supprimer l'ancienne photo si elle existe
      if (existingFarm.photo) {
        const oldPhotoPath = path.join(
          process.cwd(),
          "public",
          existingFarm.photo.replace(/^\/+/, "")
        );
        try {
          await fs.unlink(oldPhotoPath);
        } catch (err) {
          console.warn("Impossible de supprimer l'ancienne photo:", err);
        }
      }

      // Sauvegarder la nouvelle photo
      const photoPath = await Utilities.saveFile(req.files.photo as any, "uploads/farms");
      data.photo = Utilities.resolveFileUrl(req, photoPath);
    }

    // Mettre à jour la ferme
    const farm = await prisma.farm.update({
      where: { id: Number(id) },
      data,
    });

    ResponseApi.success(res, "Ferme mise à jour avec succès", 200, farm);
  } catch (error: any) {
    if (error.code === "P2025") {
      ResponseApi.error(res, "Ferme non trouvée", 404);
    } else {
      next(error);
    }
  }
};


// supprimer une ferme
export const deleteFarm = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Vérification de l'ID
    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide ou manquant", 400);
    }

    // Suppression de la ferme
    const deletedFarm = await prisma.farm.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(
      res,
      "Ferme supprimée avec succès",
      200,
      deletedFarm
    );
  } catch (error: any) {
    // Erreur Prisma si l'ID n'existe pas
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Ferme non trouvée", 404);
    }

    next(error);
  }
};


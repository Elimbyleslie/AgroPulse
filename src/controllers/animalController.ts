import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Animal } from "../typages/animal.js";
import QRCode from "qrcode";

// CREATE
export const createAnimal = async (req: Request<{}, {}, Animal>, res: Response, next: NextFunction) => {
  try {
    const data = req.body;

    // Générer le QR code si non fourni
    if (!data.qrcode) {
      data.qrcode = await QRCode.toDataURL(`${data.speciesId}-${data.farmId}-${Date.now()}`);
    }

    const animal = await prisma.animal.create({ data });
    return ResponseApi.success(res, "Animal créé avec succès", 201, animal);
  } catch (error: any) {
    next(error);
  }
};

// GET ALL
export const getAllAnimals = async (
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      search,
      speciesId,
      breedId,
      farmId,
      lotId,
      status,
      gender,
      startDate,
      endDate,
      minWeight,
      maxWeight,
      minAge,
      maxAge,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};

    // 🔍 Recherche globale
    if (search) {
      where.OR = [
        { qrcode: { contains: search as string, mode: "insensitive" } },
        { photo: { contains: search as string, mode: "insensitive" } },
        { species: { name: { contains: search as string, mode: "insensitive" } } },
        { breed: { name: { contains: search as string, mode: "insensitive" } } },
      ];
    }

    // 🐄 Filtres simples
    if (speciesId) where.speciesId = Number(speciesId);
    if (breedId) where.breedId = Number(breedId);
    if (farmId) where.farmId = Number(farmId);
    if (lotId) where.lotId = Number(lotId);
    if (status) where.status = status;
    if (gender) where.gender = gender;

    // 📅 Filtre par date de naissance
    if (startDate || endDate) {
      where.birthDate = {};
      if (startDate) where.birthDate.gte = new Date(startDate as string);
      if (endDate) where.birthDate.lte = new Date(endDate as string);
    }

    // ⚖️ Filtre par poids
    if (minWeight || maxWeight) {
      where.weight = {};
      if (minWeight) where.weight.gte = Number(minWeight);
      if (maxWeight) where.weight.lte = Number(maxWeight);
    }

    // 🕑 Filtre par âge en années
    if (minAge || maxAge) {
      where.birthDate = {};
      const now = new Date();

      if (minAge) {
        const maxBirthDate = new Date(now);
        maxBirthDate.setFullYear(now.getFullYear() - Number(minAge));
        where.birthDate.lte = maxBirthDate;
      }

      if (maxAge) {
        const minBirthDate = new Date(now);
        minBirthDate.setFullYear(now.getFullYear() - Number(maxAge));
        where.birthDate.gte = minBirthDate;
      }
    }

    // 🧭 Tri dynamique
    const validSortFields = [
      "id",
      "createdAt",
      "birthDate",
      "weight",
      "qrcode",
    ];

    const order = validSortFields.includes(sortBy as string)
      ? { [sortBy as string]: sortOrder === "asc" ? "asc" : "desc" }
      : { createdAt: "desc" };

    // 🐄 Récupération des animaux + relations
    const animals = await prisma.animal.findMany({
      skip: offset,
      take: limitNum,
      include: {
        farm: true,
        lot: true,
        species: true,
        breed: true,
        birth: { include: { mother: true, father: true } },
        birthsAsMother: true,
        birthsAsFather: true,
        healthRecords: true,
        treatments: true,
        vaccinations: true,
        deaths: true,
        reproductionAsFemale: true,
        reproductionAsMale: true,
        weights: true,
        feedings: true,
        movements: true,
        saleItems: true,
        animalTransfers: true,
      },
    });

    const totalItems = await prisma.animal.count({ where });

    return ResponseApi.success(res, "Liste des animaux récupérée", 200, {
      animals,
      pagination: {
        currentPage: pageNum,
        previousPage: pageNum > 1 ? pageNum - 1 : null,
        nextPage: pageNum * limitNum < totalItems ? pageNum + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limitNum),
      },
    });

  } catch (error) {
    next(error);
  }
};



// GET BY ID
export const getAnimalById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const animal = await prisma.animal.findUnique({
      where: { id: Number(id) },
      include: { species: true, breed: true, lot: true, farm: true },
    });

    if (!animal) return ResponseApi.error(res, "Animal non trouvé", 404);
    return ResponseApi.success(res, "Animal récupéré", 200, animal);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateAnimal = async (req: Request<{ id: string }, {}, Partial<Animal>>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const updated = await prisma.animal.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Animal mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Animal non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteAnimal = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.animal.delete({ where: { id: Number(id) } });
    return ResponseApi.success(res, "Animal supprimé avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Animal non trouvé", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Animal } from "../typages/animal.js";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { verifyQr, signQr } from "../helpers/qrcodeSignature.js";

export const validateQr = async (req: Request, res: Response) => {
  const { animalId, signature } = req.body;

  const isValid = verifyQr(Number(animalId), signature);

  if (!isValid) {
    return res.status(401).json({
      message: "QR code invalide ou falsifié",
    });
  }

  const animal = await prisma.animal.findUnique({
    where: { id: Number(animalId) },
  });

  if (!animal) {
    return res.status(404).json({ message: "Animal introuvable" });
  }

  return res.json(animal);
};

export const createAnimal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;

    //  CONVERSION DES TYPES
    if (data.farmId) data.farmId = Number(data.farmId);
    if (data.speciesId) data.speciesId = Number(data.speciesId);
    if (data.breedId) data.breedId = Number(data.breedId);
    if (data.weight) data.weight = Number(data.weight);

    // Gestion de la date
    if (typeof data.birthDate === "string") {
      const parsed = new Date(data.birthDate);
      if (Number.isNaN(parsed.getTime())) {
        return ResponseApi.error(res, "Date de naissance invalide", 400);
      }
      data.birthDate = parsed;
      
    }
    console.log("BODY:", req.body);
  console.log("FILE:", req.file); 
  
  if (!req.file) {
      return res.status(400).json({ message: "Le fichier photo est manquant dans la requête" });
  }
    // On récupère le chemin du fichier enregistré par Multer
    if (req.file) {
      data.photo = `/uploads/animals/${req.file.filename}`;
    }else{
      delete data.photo;
    }

    // 1️⃣ Vérifier si l'animal existe déjà dans cette ferme 
    if (data.name) {
      const existingAnimal = await prisma.animal.findFirst({
        where: {
          name: data.name,
          farmId: data.farmId,
        },
      });

      if (existingAnimal) {
        return ResponseApi.error(
          res,
          "Cet animal existe déjà dans cette ferme",
          400,
        );
      }
    }

    // 2️⃣ Créer l'animal
    const animal = await prisma.animal.create({
      data,
    });

    // 3️⃣ Générer QR signé
    const signature = signQr(animal.id);
    const qrValue = `ANIMAL:${animal.id}:${signature}`;

    const updatedAnimal = await prisma.animal.update({
      where: { id: animal.id },
      data: { qrcode: qrValue },
    });

    return ResponseApi.success(res, "Animal créé avec succès", 201, {
      ...updatedAnimal,
      qrValue,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllAnimals = async (
  req: Request<{}, {}, {}, any>,
  res: Response,
  next: NextFunction,
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
      skip = "0",
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;
    const skipNum = Number(skip);

    const where: any = {};

    const userId = req.user?.id;

    if (isNaN(farmId)) {
      return res.status(400).json({
        message:
          "L'identifiant de la ferme (farmId) est requis et doit être un nombre.",
      });
    }

    if (!farmId) {
      return res.status(400).json({
        message:
          "L'identifiant de la ferme (farmId) est requis pour lister les animaux.",
      });
    }
    // 🔍 Recherche globale
    if (search) {
      where.OR = [
        { qrcode: { contains: search as string } },
        { photo: { contains: search as string } },
        { species: { name: { contains: search as string } } },
        { breed: { name: { contains: search as string } } },
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
      take: 10,
      skip: 0, // Ajoutez cette ligne
      include: {
        farm: true,
        lot: true,
        species: true,
        breed: true,
        birth: {
          include: {
            mother: true,
            father: true,
          },
        },
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
      where: {
        farmId: Number(farmId),
        farm: {
          organization: {
            ownerId: userId,
          },
        },
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
export const getAnimalById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

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
export const updateAnimal = async (req:Request, res:Response) => {
  try {
    const { id } = req.params;
    const { name, farmId, speciesId, breedId, lotId, gender, birthDate, weight, status,photo } = req.body;

    // Helper pour convertir les IDs en relations Prisma
    const connectRelation = (id:number) => id  && id !== 0 
      ? { connect: { id: Number(id) } } 
      : undefined;

    const disconnectRelation = (id:number) => !id || id === 0
      ? { disconnect: true }
      : undefined;

    const updateData = {
      name,
      gender,
      birthDate: new Date(birthDate),
      weight: parseFloat(weight),
      status,
      farm: connectRelation(farmId),
      species: connectRelation(speciesId),
      breed: connectRelation(breedId) || disconnectRelation(breedId),
      lot: connectRelation(lotId),
      photo,
    };


    if (req.file) {
      updateData.photo = `/uploads/animals/${req.file.filename}`;
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        species: true,
        breed: true,
        farm: true,
        lot: true,
      }
    });

    res.status(200).json({
      meta: { message: "Animal mis à jour avec succès", status: 200 },
      data: updatedAnimal,
    });
  } catch (error:any) {
    console.error("Erreur updateAnimal:", error);
    res.status(500).json({
      meta: { message: "Erreur lors de la mise à jour", status: 500 },
      error: error.message,
    });
  }
};
// DELETE
export const deleteAnimal = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);
    const animal = await prisma.animal.findUnique({
      where: { id: Number(id) },
    });
    if (animal?.photo) {
      const photoPath = path.join(__dirname, "../../", animal.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    const deleted = await prisma.animal.delete({ where: { id: Number(id) } });
    return ResponseApi.success(
      res,
      "Animal supprimé avec succès",
      200,
      deleted,
    );
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Animal non trouvé", 404);
    next(error);
  }
};



export const assignAnimal = async (req: Request, res: Response) => {
  try {
    const animalId = Number(req.params.id);
    const { lotId, herdId, penId } = req.body;
    const userId = req.user?.id;

    const targets = [lotId, herdId, penId].filter(Boolean);
    if (targets.length !== 1) {
      return res.status(400).json({
        success: false,
        message:
          "L’animal doit être assigné à un seul : lot, herd ou enclos.",
      });
    }

    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal) {
      return res.status(404).json({
        success: false,
        message: "Animal introuvable",
      });
    }

    // 1️⃣ transaction
    const result = await prisma.$transaction(async tx => {
      // Update animal
      const updatedAnimal = await tx.animal.update({
        where: { id: animalId },
        data: {
          lotId: lotId ?? null,
          herdId: herdId ?? null,
          penId: penId ?? null,
        },
      });

      // Create movement
      await tx.animalMovement.create({
        data: {
          animalId,
          fromLotId: animal.lotId,
          toLotId: lotId ?? null,

          fromHerdId: animal.herdId,
          toHerdId: herdId ?? null,

          fromPenId: animal.penId,
          toPenId: penId ?? null,

          movedById: userId ?? null,
          date: new Date(),
        },
      });

      return updatedAnimal;
    });

    return res.status(200).json({
      success: true,
      message: "Animal assigné et mouvement enregistré",
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l’assignation de l’animal",
    });
  }
};

export const unassignAnimal = async (req: Request, res: Response) => {
  try {
    const animalId = Number(req.params.id);
    const userId = req.user?.id; // On récupère l'ID de celui qui fait l'action

    if (isNaN(animalId)) {
      return res.status(400).json({ success: false, message: "ID d'animal invalide" });
    }

    // 1. Trouver l'animal pour connaître son emplacement actuel avant de le supprimer
    const animal = await prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal) {
      return res.status(404).json({ success: false, message: "Animal introuvable" });
    }

    // 2. Transaction pour garantir que l'animal est libéré ET que le mouvement est loggé
    const result = await prisma.$transaction(async (tx) => {
      // Mise à jour de l'animal : on met tout à null
      const updated = await tx.animal.update({
        where: { id: animalId },
        data: {
          lotId: null,
          herdId: null,
          penId: null,
        },
      });

      // Enregistrement du mouvement de "sortie"
      await tx.animalMovement.create({
        data: {
          animalId,
          fromLotId: animal.lotId,
          fromHerdId: animal.herdId,
          fromPenId: animal.penId,
          toLotId: null,
          toHerdId: null,
          toPenId: null,
          movedById: userId ?? null,
          date: new Date(),
        },
      });

      return updated;
    });

    return res.status(200).json({
      success: true,
      message: "L'animal a été désassigné et le mouvement historique a été enregistré",
      data: result,
    });

  } catch (error) {
    console.error("Erreur unassignAnimal:", error);
    return res.status(500).json({ success: false, message: "Erreur technique lors de la désassignation" });
  }
};
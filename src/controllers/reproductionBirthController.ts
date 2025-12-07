import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { ReproductionWithBirth } from "../typages/reproductionWithBirth.js";
import {Birth} from '../typages/birth.js'

// ======================================================
// CREATE Reproduction + option Birth automatique
// ======================================================
export const createReproductionWithBirth = async (
  req: Request<{}, {}, ReproductionWithBirth>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      femaleId,
      maleId,
      matingDate,
      expectedBirth,
      actualBirthDate,
      numberBorn,
      notes,
    } = req.body;

    // 1️⃣ Créer la reproduction
    const reproduction = await prisma.animalReproduction.create({
      data: {
        femaleId,
        maleId,
        matingDate,
        expectedBirth,
        actualBirthDate,
        numberBorn,
        notes,
      },
    });

    let birth : any = null;

    // 2️⃣ Si la date effective de naissance est renseignée, créer la Birth
    if (actualBirthDate && numberBorn && femaleId) {
      birth = await prisma.birth.create({
        data: {
          farmId: (await prisma.animal.findUnique({ where: { id: femaleId } }))?.farmId || 0,
          motherId: femaleId,
          fatherId: maleId,
          date: new Date(actualBirthDate),
          numberBorn,
          numberAlive: numberBorn,
          numberDead: 0,
          notes: notes || "",
          userId: null,
        },
      });

      // 3️⃣ Créer les animaux "newborns"
      const femaleAnimal = await prisma.animal.findUnique({ where: { id: femaleId } });
      const newbornsData = Array.from({ length: numberBorn }).map(() => ({
        name: "Newborn" , // Nom temporaire
        farmId: birth.farmId,
        breedId: femaleAnimal?.breedId || null,
        speciesId: femaleAnimal?.speciesId || 0,
        lotId: null,
        birthId: birth.id,
      }));

      await prisma.animal.createMany({ data: newbornsData });
    }

    return ResponseApi.success(
      res,
      "Reproduction créée avec naissance si applicable",
      201,
      { reproduction, birth }
    );
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Reproductions + Birth info
// ======================================================
export const getAllReproductionWithBirth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reproductions = await prisma.animalReproduction.findMany({
      include: {
        female: true,
        male: true,
        births: {
          include: { newborns: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return ResponseApi.success(res, "Liste des reproductions récupérée", 200, reproductions);
  } catch (error) {
    next(error);
  }
};

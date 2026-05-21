// controllers/geneticPerformanceController.ts
import { Request, Response, NextFunction } from 'express';
import ResponseApi from '../helpers/response.js';
import prisma from '../models/prismaClient.js';

// ==================== LIST GENETIC PERFORMANCES ====================
export const listGeneticPerformances = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, page = 1, limit = 20 } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, 'Le farmId est requis', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      farmId: Number(farmId),
    };

    const [performances, total] = await Promise.all([
      prisma.geneticPerformance.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { growthRate: 'desc' },
        include: {
          animal: {
            select: {
              id: true,
              name: true,
              gender: true,
              species: { select: { name: true } },
              breed: { select: { name: true } },
            },
          },
        },
      }),
      prisma.geneticPerformance.count({ where }),
    ]);

    return ResponseApi.success(
      res,
      'Performances génétiques récupérées avec succès',
      200,
      {
        data: performances,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalItems: total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      }
    );
  } catch (error) {
    next(error);
  }
};

// ==================== GET GENETIC PERFORMANCE BY ANIMAL ID ====================
export const getGeneticPerformanceByAnimalId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.params;

    const performance = await prisma.geneticPerformance.findUnique({
      where: { animalId: Number(animalId) },
      include: { animal: true },
    });

    if (!performance) {
      return ResponseApi.error(res, 'Aucune donnée génétique trouvée pour cet animal', 404);
    }

    return ResponseApi.success(
      res,
      'Performance génétique récupérée avec succès',
      200,
      performance
    );
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE GENETIC PERFORMANCE ====================
export const createGeneticPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      animalId,
      growthRate,
      birthWeight,
      weaningWeight,
      prolificityScore,
      maternalInstinct,
      diseaseResistance,
      inbreedingCoeff,
    } = req.body;


  console.log("📥 req.body :", req.body); // ← ajoute ça
  console.log("📥 req.headers :", req.headers["content-type"]); 
    if (!farmId || !animalId) {
      return ResponseApi.error(res, 'farmId et animalId sont requis', 400);
    }

    if (maternalInstinct !== undefined && (maternalInstinct < 1 || maternalInstinct > 10)) {
      return ResponseApi.error(res, 'maternalInstinct doit être compris entre 1 et 10', 400);
    }

    if (diseaseResistance !== undefined && (diseaseResistance < 1 || diseaseResistance > 10)) {
      return ResponseApi.error(res, 'diseaseResistance doit être compris entre 1 et 10', 400);
    }

    const existingPerformance = await prisma.geneticPerformance.findUnique({
      where: { animalId: Number(animalId) },
    });

    if (existingPerformance) {
      return ResponseApi.error(
        res,
        'Une fiche de performance génétique existe déjà pour cet animal',
        400
      );
    }

    const performance = await prisma.geneticPerformance.create({
      data: {
        farmId: Number(farmId),
        animalId: Number(animalId),
        ...(growthRate !== undefined && { growthRate: Number(growthRate) }),
        ...(birthWeight !== undefined && { birthWeight: Number(birthWeight) }),
        ...(weaningWeight !== undefined && { weaningWeight: Number(weaningWeight) }),
        ...(prolificityScore !== undefined && { prolificityScore: Number(prolificityScore) }),
        ...(maternalInstinct !== undefined && { maternalInstinct: Number(maternalInstinct) }),
        ...(diseaseResistance !== undefined && { diseaseResistance: Number(diseaseResistance) }),
        ...(inbreedingCoeff !== undefined && { inbreedingCoeff: Number(inbreedingCoeff) }),
      },
      include: {
        animal: {
          include: {
            species: true,
            breed: true,
          },
        },
      },
    });

    return ResponseApi.success(res, 'Performance génétique créée avec succès', 201, performance);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE GENETIC PERFORMANCE ====================
export const updateGeneticPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      growthRate,
      birthWeight,
      weaningWeight,
      prolificityScore,
      maternalInstinct,
      diseaseResistance,
      inbreedingCoeff,
    } = req.body;

    if (maternalInstinct !== undefined && (maternalInstinct < 1 || maternalInstinct > 10)) {
      return ResponseApi.error(res, 'maternalInstinct doit être compris entre 1 et 10', 400);
    }

    if (diseaseResistance !== undefined && (diseaseResistance < 1 || diseaseResistance > 10)) {
      return ResponseApi.error(res, 'diseaseResistance doit être compris entre 1 et 10', 400);
    }

    const existingPerformance = await prisma.geneticPerformance.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPerformance) {
      return ResponseApi.error(res, 'Performance génétique non trouvée', 404);
    }

    const performance = await prisma.geneticPerformance.update({
      where: { id: Number(id) },
      data: {
        ...(growthRate !== undefined && { growthRate: Number(growthRate) }),
        ...(birthWeight !== undefined && { birthWeight: Number(birthWeight) }),
        ...(weaningWeight !== undefined && { weaningWeight: Number(weaningWeight) }),
        ...(prolificityScore !== undefined && { prolificityScore: Number(prolificityScore) }),
        ...(maternalInstinct !== undefined && { maternalInstinct: Number(maternalInstinct) }),
        ...(diseaseResistance !== undefined && { diseaseResistance: Number(diseaseResistance) }),
        ...(inbreedingCoeff !== undefined && { inbreedingCoeff: Number(inbreedingCoeff) }),
      },
      include: {
        animal: {
          include: {
            species: true,
            breed: true,
          },
        },
      },
    });

    return ResponseApi.success(res, 'Performance génétique mise à jour avec succès', 200, performance);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE GENETIC PERFORMANCE ====================
export const deleteGeneticPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existingPerformance = await prisma.geneticPerformance.findUnique({
      where: { id: Number(id) },
    });

    if (!existingPerformance) {
      return ResponseApi.error(res, 'Performance génétique non trouvée', 404);
    }

    await prisma.geneticPerformance.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, 'Performance génétique supprimée avec succès', 200, Number(id));
  } catch (error) {
    next(error);
  }
};

// ==================== SYNC / CALCULATE PERFORMANCE ====================
export const syncGeneticPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { animalId } = req.params;

    const animal = await prisma.animal.findUnique({
      where: { id: Number(animalId) },
      include: {
        birthsAsMother: { include: { newborns: true } },
        weights: { orderBy: { date: 'asc' } },
      },
    });

    if (!animal) {
      return ResponseApi.error(res, 'Animal non trouvé', 404);
    }

    // Calcul du GMQ (Gain Moyen Quotidien)
    let calculatedGrowthRate = 0;
    const weights = animal.weights;
    if (weights.length >= 2) {
      const first = weights[0];
      const last = weights[weights.length - 1];
      const diffDays = Math.ceil(
        Math.abs(last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays > 0) calculatedGrowthRate = (last.weight - first.weight) / diffDays;
    }

    // Calcul du score de prolificité
    const births = animal.birthsAsMother || [];
    const totalOffspring = births.reduce((sum, b) => sum + (b.numberBorn || 0), 0);
    const calculatedProlificityScore = births.length > 0 ? totalOffspring / births.length : 0;

    // Upsert : mise à jour ou création automatique
    const performance = await prisma.geneticPerformance.upsert({
      where: { animalId: Number(animalId) },
      update: {
        growthRate: calculatedGrowthRate,
        prolificityScore: calculatedProlificityScore,
        ...(weights.length > 0 && { birthWeight: weights[0].weight }),
      },
      create: {
        animalId: Number(animalId),
        farmId: animal.farmId,
        growthRate: calculatedGrowthRate,
        prolificityScore: calculatedProlificityScore,
        birthWeight: weights.length > 0 ? weights[0].weight : null,
      },
    });

    return ResponseApi.success(
      res,
      'Performance génétique synchronisée avec succès',
      200,
      performance
    );
  } catch (error) {
    next(error);
  }
};

// ==================== GET GENETIC PERFORMANCE STATS ====================
export const getGeneticPerformanceStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, 'Le farmId est requis', 400);
    }

    const [total, averages, highInbreedingCount] = await Promise.all([
      prisma.geneticPerformance.count({
        where: { farmId: Number(farmId) },
      }),
      prisma.geneticPerformance.aggregate({
        where: { farmId: Number(farmId) },
        _avg: {
          growthRate: true,
          birthWeight: true,
          weaningWeight: true,
          prolificityScore: true,
          maternalInstinct: true,
          diseaseResistance: true,
          inbreedingCoeff: true,
        },
        _max: {
          growthRate: true,
          prolificityScore: true,
          inbreedingCoeff: true,
        },
        _min: {
          inbreedingCoeff: true,
        },
      }),
      // Animaux à risque de consanguinité élevée (> 12.5%)
      prisma.geneticPerformance.count({
        where: {
          farmId: Number(farmId),
          inbreedingCoeff: { gt: 0.125 },
        },
      }),
    ]);

    const stats = {
      total,
      averages: averages._avg,
      max: averages._max,
      min: averages._min,
      highInbreedingRiskCount: highInbreedingCount,
    };

    return ResponseApi.success(
      res,
      'Statistiques génétiques récupérées avec succès',
      200,
      stats
    );
  } catch (error) {
    next(error);
  }
};
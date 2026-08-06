// controllers/reproductionCycleController.ts
import { Request, Response, NextFunction } from 'express';
import  ResponseApi  from '../helpers/response.js';
import  prisma  from '../models/prismaClient.js';

// ==================== LIST CYCLES ====================
export const listReproductionCycles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, animalId, status, cycleType, page = 1, limit = 20 } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, 'Le farmId est requis', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      farmId: Number(farmId),
      ...(animalId && { animalId: Number(animalId) }),
      ...(status && { status: status as string }),
      ...(cycleType && { cycleType: cycleType as string }),
    };

    const [cycles, total] = await Promise.all([
      prisma.reproductionCycle.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { startDate: 'desc' },
        include: {
          animal: {
            select: {
              id: true,
              name: true,
              species: { select: { name: true } },
            },
          },
          male: {
            select: {
              id: true,
              name: true,
            },
          },
          technician: {
            select: {
              id: true,
              name: true,
            },
          },
          gestation: {
            select: {
              id: true,
              status: true,
              expectedDeliveryDate: true,
            },
          },
        },
      }),
      prisma.reproductionCycle.count({ where }),
    ]);

    return ResponseApi.success(res, 'Cycles récupérés avec succès', 200, {
      data: cycles,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalItems: total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== GET CYCLE BY ID ====================
export const getReproductionCycleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const cycle = await prisma.reproductionCycle.findUnique({
      where: { id: Number(id) },
      include: {
        animal: {
          include: {
            species: true,
            breed: true,
          },
        },
        male: true,
        technician: true,
        gestation: {
          include: {
            checkups: {
              orderBy: { checkDate: 'desc' },
            },
          },
        },
      },
    });

    if (!cycle) {
      return ResponseApi.error(res, 'Cycle non trouvé', 404);
    }

    return ResponseApi.success(res, 'Cycle récupéré avec succès', 200, cycle);
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE CYCLE ====================
export const createReproductionCycle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      animalId,
      cycleType,
      startDate,
      endDate,
      status,
      heatIntensity,
      heatBehavior,
      inseminationType,
      maleId,
      semenBatch,
      technicianId,
      notes,
    } = req.body;

    // Validation
    if (!farmId || !animalId || !cycleType || !startDate) {
      return ResponseApi.error(
        res,
        'farmId, animalId, cycleType et startDate sont requis',
        400
      );
    }

    // Vérifier que l'animal existe et est une femelle
    const animal = await prisma.animal.findUnique({
      where: { id: Number(animalId) },
    });

    if (!animal) {
      return ResponseApi.error(res, 'Animal non trouvé', 404);
    }

    if (animal.gender !== 'female') {
      return ResponseApi.error(
        res,
        'Seules les femelles peuvent avoir des cycles de reproduction',
        400
      );
    }

    const cycle = await prisma.reproductionCycle.create({
      data: {
        farmId: Number(farmId),
        animalId: Number(animalId),
        cycleType,
        startDate: new Date(startDate),
        ...(endDate && { endDate: new Date(endDate) }),
        status: status || 'en_cours',
        ...(heatIntensity && { heatIntensity: Number(heatIntensity) }),
        ...(heatBehavior && { heatBehavior }),
        ...(inseminationType && { inseminationType }),
        ...(maleId && { maleId: Number(maleId) }),
        ...(semenBatch && { semenBatch }),
        ...(technicianId && { technicianId: Number(technicianId) }),
        ...(notes && { notes }),
      },
      include: {
        animal: true,
        male: true,
        technician: true,
      },
    });

    return ResponseApi.success(res, 'Cycle créé avec succès', 201, cycle);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE CYCLE ====================
export const updateReproductionCycle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      cycleType,
      startDate,
      endDate,
      status,
      heatIntensity,
      heatBehavior,
      inseminationType,
      maleId,
      semenBatch,
      technicianId,
      notes,
    } = req.body;

    const existingCycle = await prisma.reproductionCycle.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCycle) {
      return ResponseApi.error(res, 'Cycle non trouvé', 404);
    }

    const cycle = await prisma.reproductionCycle.update({
      where: { id: Number(id) },
      data: {
        ...(cycleType && { cycleType }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status && { status }),
        ...(heatIntensity !== undefined && { heatIntensity: Number(heatIntensity) }),
        ...(heatBehavior && { heatBehavior }),
        ...(inseminationType && { inseminationType }),
        ...(maleId !== undefined && { maleId: maleId ? Number(maleId) : null }),
        ...(semenBatch && { semenBatch }),
        ...(technicianId !== undefined && {
          technicianId: technicianId ? Number(technicianId) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        animal: true,
        male: true,
        technician: true,
        gestation: true,
      },
    });

    return ResponseApi.success(res, 'Cycle mis à jour avec succès', 200, cycle);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE CYCLE ====================
export const deleteReproductionCycle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existingCycle = await prisma.reproductionCycle.findUnique({
      where: { id: Number(id) },
      include: { gestation: true },
    });

    if (!existingCycle) {
      return ResponseApi.error(res, 'Cycle non trouvé', 404);
    }

    if (existingCycle.gestation) {
      return ResponseApi.error(
        res,
        'Impossible de supprimer un cycle lié à une gestation',
        400
      );
    }

    await prisma.reproductionCycle.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, 'Cycle supprimé avec succès', 200, Number(id));
  } catch (error) {
    next(error);
  }
};

// ==================== STATS CYCLES ====================
export const getReproductionCycleStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, 'Le farmId est requis', 400);
    }

    const [total, byCycleType, byStatus] = await Promise.all([
      prisma.reproductionCycle.count({
        where: { farmId: Number(farmId) },
      }),
      prisma.reproductionCycle.groupBy({
        by: ['cycleType'],
        where: { farmId: Number(farmId) },
        _count: true,
      }),
      prisma.reproductionCycle.groupBy({
        by: ['status'],
        where: { farmId: Number(farmId) },
        _count: true,
      }),
    ]);

    const stats = {
      total,
      byCycleType: byCycleType.reduce((acc, item) => {
        acc[item.cycleType] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };

    return ResponseApi.success(
      res,
      'Statistiques récupérées avec succès',
      200,
      stats
    );
  } catch (error) {
    next(error);
  }
};
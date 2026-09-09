// controllers/gestationController.ts
import { Request, Response, NextFunction } from 'express';
import ResponseApi  from '../helpers/response.js';
import prisma  from '../models/prismaClient.js';

// ==================== LIST GESTATIONS ====================
export const listGestations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, animalId, status, page = 1, limit = 20 } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, 'Le farmId est requis', 400);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      farmId: Number(farmId),
      ...(animalId && { animalId: Number(animalId) }),
      ...(status && { status: status as string }),
    };

    const [gestations, total] = await Promise.all([
      prisma.gestation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { inseminationDate: 'desc' },
        include: {
          animal: {
            select: {
              id: true,
              name: true,
              species: { select: { name: true } },
            },
          },
          reproductionCycle: {
            select: {
              id: true,
              cycleType: true,
              inseminationType: true,
              male: { select: { id: true, name: true } },
            },
          },
          veterinarian: {
            select: {
              id: true,
              name: true,
            },
          },
          birth: {
            select: {
              id: true,
              numberBorn: true,
              numberAlive: true,
              date: true,
            },
          },
          checkups: {
            take: 1,
            orderBy: { checkDate: 'desc' },
          },
        },
      }),
      prisma.gestation.count({ where }),
    ]);

    // Calculer les jours de gestation pour chaque gestation
    const gestationsWithDays = gestations.map((g) => {
      const today = new Date();
      const insemDate = new Date(g.inseminationDate);
      const gestationDays = g.actualDeliveryDate
        ? Math.floor(
            (new Date(g.actualDeliveryDate).getTime() - insemDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : Math.floor((today.getTime() - insemDate.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...g,
        gestationDays,
      };
    });

    return ResponseApi.success(res, 'Gestations récupérées avec succès', 200, {
      data: gestationsWithDays,
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

// ==================== GET GESTATION BY ID ====================
export const getGestationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const gestation = await prisma.gestation.findUnique({
      where: { id: Number(id) },
      include: {
        animal: {
          include: {
            species: true,
            breed: true,
          },
        },
        reproductionCycle: {
          include: {
            male: true,
            technician: true,
          },
        },
        veterinarian: true,
        checkups: {
          orderBy: { checkDate: 'desc' },
          include: {
            veterinarian: true,
          },
        },
        birth: {
          include: {
            newborns: true,
          },
        },
      },
    });

    if (!gestation) {
      return ResponseApi.error(res, 'Gestation non trouvée', 404);
    }

    // Calculer les jours de gestation
    const today = new Date();
    const insemDate = new Date(gestation.inseminationDate);
    const gestationDays = gestation.actualDeliveryDate
      ? Math.floor(
          (new Date(gestation.actualDeliveryDate).getTime() - insemDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : Math.floor((today.getTime() - insemDate.getTime()) / (1000 * 60 * 60 * 24));

    return ResponseApi.success(res, 'Gestation récupérée avec succès', 200, {
      ...gestation,
      gestationDays,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE GESTATION ====================
export const createGestation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      animalId,
      reproductionCycleId,
      inseminationDate,
      expectedDeliveryDate,
      status,
      confirmationDate,
      confirmationMethod,
      numberOfOffspring,
      veterinarianId,
      notes,
    } = req.body;

    // Validation
    if (!farmId || !animalId || !reproductionCycleId || !inseminationDate || !expectedDeliveryDate) {
      return ResponseApi.error(
        res,
        'farmId, animalId, reproductionCycleId, inseminationDate et expectedDeliveryDate sont requis',
        400
      );
    }

    // Vérifier qu'il n'y a pas déjà une gestation active pour cet animal
    const existingGestation = await prisma.gestation.findFirst({
      where: {
        animalId: Number(animalId),
        status: {
          in: ['en_attente', 'confirmee', 'en_cours'],
        },
      },
    });

    if (existingGestation) {
      return ResponseApi.error(
        res,
        'Cet animal a déjà une gestation en cours',
        400
      );
    }

    const gestation = await prisma.gestation.create({
      data: {
        farmId: Number(farmId),
        animalId: Number(animalId),
        reproductionCycleId: Number(reproductionCycleId),
        inseminationDate: new Date(inseminationDate),
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        status: status || 'en_attente',
        ...(confirmationDate && { confirmationDate: new Date(confirmationDate) }),
        ...(confirmationMethod && { confirmationMethod }),
        ...(numberOfOffspring && { numberOfOffspring: Number(numberOfOffspring) }),
        ...(veterinarianId && { veterinarianId: Number(veterinarianId) }),
        ...(notes && { notes }),
      },
      include: {
        animal: true,
        reproductionCycle: {
          include: {
            male: true,
          },
        },
        veterinarian: true,
      },
    });

    // Mettre à jour le cycle de reproduction
    await prisma.reproductionCycle.update({
      where: { id: Number(reproductionCycleId) },
      data: { status: 'confirme' },
    });

    return ResponseApi.success(res, 'Gestation créée avec succès', 201, gestation);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE GESTATION ====================
export const updateGestation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      expectedDeliveryDate,
      actualDeliveryDate,
      status,
      confirmationDate,
      confirmationMethod,
      numberOfOffspring,
      complications,
      abortionDate,
      abortionCause,
      lastCheckDate,
      veterinarianId,
      notes,
    } = req.body;

    const existingGestation = await prisma.gestation.findUnique({
      where: { id: Number(id) },
    });

    if (!existingGestation) {
      return ResponseApi.error(res, 'Gestation non trouvée', 404);
    }

    const gestation = await prisma.gestation.update({
      where: { id: Number(id) },
      data: {
        ...(expectedDeliveryDate && {
          expectedDeliveryDate: new Date(expectedDeliveryDate),
        }),
        ...(actualDeliveryDate && {
          actualDeliveryDate: new Date(actualDeliveryDate),
        }),
        ...(status && { status }),
        ...(confirmationDate && { confirmationDate: new Date(confirmationDate) }),
        ...(confirmationMethod && { confirmationMethod }),
        ...(numberOfOffspring !== undefined && {
          numberOfOffspring: Number(numberOfOffspring),
        }),
        ...(complications !== undefined && { complications }),
        ...(abortionDate && { abortionDate: new Date(abortionDate) }),
        ...(abortionCause && { abortionCause }),
        ...(lastCheckDate && { lastCheckDate: new Date(lastCheckDate) }),
        ...(veterinarianId !== undefined && {
          veterinarianId: veterinarianId ? Number(veterinarianId) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        animal: true,
        reproductionCycle: true,
        veterinarian: true,
        checkups: {
          orderBy: { checkDate: 'desc' },
        },
        birth: true,
      },
    });

    return ResponseApi.success(
      res,
      'Gestation mise à jour avec succès',
      200,
      gestation
    );
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE GESTATION ====================
export const deleteGestation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existingGestation = await prisma.gestation.findUnique({
      where: { id: Number(id) },
      include: { birth: true, checkups: true },
    });

    if (!existingGestation) {
      return ResponseApi.error(res, 'Gestation non trouvée', 404);
    }

    if (existingGestation.birth) {
      return ResponseApi.error(
        res,
        'Impossible de supprimer une gestation liée à une naissance',
        400
      );
    }

    // Supprimer les checkups associés
    if (existingGestation.checkups.length > 0) {
      await prisma.gestationCheckup.deleteMany({
        where: { gestationId: Number(id) },
      });
    }

    await prisma.gestation.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(
      res,
      'Gestation supprimée avec succès',
      200,
      Number(id)
    );
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE GESTATION CHECKUP ====================
export const createGestationCheckup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gestationId } = req.params;
    const {
      checkDate,
      motherWeight,
      motherCondition,
      fetalHeartbeat,
      fetalMovement,
      complications,
      veterinarianId,
      notes,
    } = req.body;

    if (!checkDate) {
      return ResponseApi.error(res, 'checkDate est requis', 400);
    }

    const gestation = await prisma.gestation.findUnique({
      where: { id: Number(gestationId) },
    });

    if (!gestation) {
      return ResponseApi.error(res, 'Gestation non trouvée', 404);
    }

    // Calculer le jour de gestation
    const insemDate = new Date(gestation.inseminationDate);
    const checkDateObj = new Date(checkDate);
    const gestationDay = Math.floor(
      (checkDateObj.getTime() - insemDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const checkup = await prisma.gestationCheckup.create({
      data: {
        gestationId: Number(gestationId),
        checkDate: new Date(checkDate),
        gestationDay,
        ...(motherWeight && { motherWeight: Number(motherWeight) }),
        ...(motherCondition && { motherCondition: Number(motherCondition) }),
        ...(fetalHeartbeat !== undefined && { fetalHeartbeat: Boolean(fetalHeartbeat) }),
        ...(fetalMovement !== undefined && { fetalMovement: Boolean(fetalMovement) }),
        ...(complications && { complications }),
        ...(veterinarianId && { veterinarianId: Number(veterinarianId) }),
        ...(notes && { notes }),
      },
      include: {
        veterinarian: true,
      },
    });

    // Mettre à jour lastCheckDate dans la gestation
    await prisma.gestation.update({
      where: { id: Number(gestationId) },
      data: { lastCheckDate: new Date(checkDate) },
    });

    return ResponseApi.success(res, 'Contrôle ajouté avec succès', 201, checkup);
  } catch (error) {
    next(error);
  }
};

// ==================== GET GESTATION STATS ====================
export const getGestationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, 'Le farmId est requis', 400);
    }

    const [total, byStatus, expectedDeliveries] = await Promise.all([
      prisma.gestation.count({
        where: { farmId: Number(farmId) },
      }),
      prisma.gestation.groupBy({
        by: ['status'],
        where: { farmId: Number(farmId) },
        _count: true,
      }),
      prisma.gestation.count({
        where: {
          farmId: Number(farmId),
          status: { in: ['confirmee', 'en_cours'] },
          expectedDeliveryDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          },
        },
      }),
    ]);

    const stats = {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      expectedDeliveriesNext30Days: expectedDeliveries,
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

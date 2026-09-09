// controllers/gestationCheckupController.ts
import { Request, Response, NextFunction } from 'express';
import ResponseApi  from '../helpers/response.js';
import prisma  from '../models/prismaClient.js';

// ==================== LIST CHECKUPS FOR A GESTATION ====================
export const listGestationCheckups = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { gestationId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [checkups, total] = await Promise.all([
      prisma.gestationCheckup.findMany({
        where: { gestationId: Number(gestationId) },
        skip,
        take: Number(limit),
        orderBy: { checkDate: 'desc' },
        include: {
          veterinarian: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.gestationCheckup.count({
        where: { gestationId: Number(gestationId) },
      }),
    ]);

    return ResponseApi.success(res, 'Contrôles récupérés avec succès', 200, {
      data: checkups,
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

// ==================== GET CHECKUP BY ID ====================
export const getCheckupById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const checkup = await prisma.gestationCheckup.findUnique({
      where: { id: Number(id) },
      include: {
        gestation: {
          include: {
            animal: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        veterinarian: true,
      },
    });

    if (!checkup) {
      return ResponseApi.error(res, 'Contrôle non trouvé', 404);
    }

    return ResponseApi.success(res, 'Contrôle récupéré avec succès', 200, checkup);
  } catch (error) {
    next(error);
  }
};

// ==================== CREATE CHECKUP ====================
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

    // Vérifier que la gestation existe
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

    if (gestationDay < 0) {
      return ResponseApi.error(
        res,
        'La date de contrôle ne peut pas être avant la date d\'insémination',
        400
      );
    }

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

    return ResponseApi.success(res, 'Contrôle créé avec succès', 201, checkup);
  } catch (error) {
    next(error);
  }
};

// ==================== UPDATE CHECKUP ====================
export const updateGestationCheckup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
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

    const existingCheckup = await prisma.gestationCheckup.findUnique({
      where: { id: Number(id) },
      include: { gestation: true },
    });

    if (!existingCheckup) {
      return ResponseApi.error(res, 'Contrôle non trouvé', 404);
    }

    // Recalculer gestationDay si checkDate change
    let gestationDay = existingCheckup.gestationDay;
    if (checkDate) {
      const insemDate = new Date(existingCheckup.gestation.inseminationDate);
      const newCheckDate = new Date(checkDate);
      gestationDay = Math.floor(
        (newCheckDate.getTime() - insemDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (gestationDay < 0) {
        return ResponseApi.error(
          res,
          'La date de contrôle ne peut pas être avant la date d\'insémination',
          400
        );
      }
    }

    const checkup = await prisma.gestationCheckup.update({
      where: { id: Number(id) },
      data: {
        ...(checkDate && { checkDate: new Date(checkDate), gestationDay }),
        ...(motherWeight !== undefined && { motherWeight: Number(motherWeight) }),
        ...(motherCondition !== undefined && { motherCondition: Number(motherCondition) }),
        ...(fetalHeartbeat !== undefined && { fetalHeartbeat: Boolean(fetalHeartbeat) }),
        ...(fetalMovement !== undefined && { fetalMovement: Boolean(fetalMovement) }),
        ...(complications !== undefined && { complications }),
        ...(veterinarianId !== undefined && {
          veterinarianId: veterinarianId ? Number(veterinarianId) : null,
        }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        veterinarian: true,
        gestation: {
          include: {
            animal: true,
          },
        },
      },
    });

    return ResponseApi.success(res, 'Contrôle mis à jour avec succès', 200, checkup);
  } catch (error) {
    next(error);
  }
};

// ==================== DELETE CHECKUP ====================
export const deleteGestationCheckup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const existingCheckup = await prisma.gestationCheckup.findUnique({
      where: { id: Number(id) },
    });

    if (!existingCheckup) {
      return ResponseApi.error(res, 'Contrôle non trouvé', 404);
    }

    await prisma.gestationCheckup.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(
      res,
      'Contrôle supprimé avec succès',
      200,
      Number(id)
    );
  } catch (error) {
    next(error);
  }
};

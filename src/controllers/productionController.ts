import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { ProductionCreateInput, ProductionUpdateInput } from "../typages/production.js";

// ======================================================
// CREATE Production
// ======================================================
export const createProduction = async (
  req: Request<{}, {}, ProductionCreateInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      farmId,
      lotId,
      animalId,
      herdId,
      penId,
      date,
      category,
      type,
      quantity,
      unit,
      qualityGrade,
      notes,
      userId,
    } = req.body;

    const production = await prisma.production.create({
      data: {
        farmId: Number(farmId),
        lotId: lotId ? Number(lotId) : null,
        animalId: animalId ? Number(animalId) : null,
        herdId: herdId ? Number(herdId) : null,
        penId: penId ? Number(penId) : null,
        date: date ? new Date(date) : new Date(),
        category: category,
        type: type,
        quantity: Number(quantity),
        unit,
        qualityGrade: qualityGrade || null,
        notes: notes || null,
        userId: userId ? Number(userId) : null,
      },
      include: {
        lot: { select: { name: true } },
        animal: { select: { name: true } },
        herd: { select: { name: true } },
        pen: { select: { name: true } },
        user: { select: { userName: true, email: true } },
      },
    });

    return ResponseApi.success(res, "Production enregistrée avec succès", 201, production);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Production
// ======================================================
export const updateProduction = async (
  req: Request<{ id: string }, {}, ProductionUpdateInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      farmId,
      lotId,
      animalId,
      herdId,
      penId,
      date,
      category,
      type,
      quantity,
      unit,
      qualityGrade,
      notes,
      userId,
    } = req.body;

  const updated = await prisma.production.update({
  where: { id: Number(req.params.id) },
  data: {
    ...(farmId !== undefined && { farmId: Number(farmId) }),
    ...(lotId !== undefined && { lotId: lotId ? Number(lotId) : null }),
    ...(animalId !== undefined && { animalId: animalId ? Number(animalId) : null }),
    ...(herdId !== undefined && { herdId: herdId ? Number(herdId) : null }),
    ...(penId !== undefined && { penId: penId ? Number(penId) : null }),
    ...(date !== undefined && { date: date ? new Date(date) : new Date() }),
    ...(category !== undefined && { category: category }),   // ← minuscule
    ...(type !== undefined && { type: type }),               // ← minuscule
    ...(quantity !== undefined && { quantity: Number(quantity) }),
    ...(unit !== undefined && { unit }),
    ...(qualityGrade !== undefined && { qualityGrade: qualityGrade || null }),
    ...(notes !== undefined && { notes: notes || null }),
    ...(userId !== undefined && { userId: userId ? Number(userId) : null }),
  },
  include: {
    lot: { select: { name: true } },
    animal: { select: { name: true } },
    herd: { select: { name: true } },
    pen: { select: { name: true } },
  },
});

    return ResponseApi.success(res, "Production mise à jour avec succès", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Production non trouvée", 404);
    }
    next(error);
  }
};


export const getAllProductions = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId: string;
      lotId?: string;
      animalId?: string;
      herdId?: string;
      penId?: string;
      type?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      farmId,
      lotId,
      animalId,
      herdId,
      penId,
      type,
      category,
      startDate,
      endDate,
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(100, Math.max(1, Number(limit))); // max 100 par page
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = { farmId: Number(farmId) };

    if (lotId) where.lotId = Number(lotId);
    if (animalId) where.animalId = Number(animalId);
    if (herdId) where.herdId = Number(herdId);
    if (penId) where.penId = Number(penId);
    if (type) where.Type = { contains: type, mode: "insensitive" };
    if (category) where.Category = category;
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    const [productions, totalItems] = await Promise.all([
      prisma.production.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { date: "desc" },
        include: {
          lot: { select: { id: true, name: true } },
          animal: { select: { id: true, name: true } },
          herd: { select: { id: true, name: true } },
          pen: { select: { id: true, name: true } },
          user: { select: { id: true, userName: true, email: true } },
          saleItems: { select: { id: true, saleId: true } },
        },
      }),
      prisma.production.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des productions récupérée", 200, {
      productions,
      pagination: {
        currentPage: pageNumber,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNumber),
        limit: limitNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET Production BY ID (Version améliorée)
// ======================================================
export const getProductionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const production = await prisma.production.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        lot: { select: { id: true, name: true } },
        animal: { select: { id: true, name: true, breed: true } },
        herd: { select: { id: true, name: true } },
        pen: { select: { id: true, name: true } },
        user: { select: { id: true, userName: true, email: true } },
        saleItem: { select: { id: true, saleId: true } },
      },
    });

    if (!production) {
      return ResponseApi.error(res, "Production non trouvée", 404);
    }

    return ResponseApi.success(res, "Production récupérée avec succès", 200, production);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// DELETE Production (Version améliorée)
// ======================================================
export const deleteProduction = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    // Vérification optionnelle avant suppression (recommandé)
    const production = await prisma.production.findUnique({
      where: { id },
      select: { id: true, farmId: true },
    });

    if (!production) {
      return ResponseApi.error(res, "Production non trouvée", 404);
    }

    const deleted = await prisma.production.delete({
      where: { id },
    });

    return ResponseApi.success(res, "Production supprimée avec succès", 200, {
      id: deleted.id,
      farmId: deleted.farmId,
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Production non trouvée", 404);
    }
    next(error);
  }
};


// ======================================================
// GET Production Stats 
// ======================================================
export const getProductionStats = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId: string;
      lotId?: string;
      herdId?: string;
      startDate?: string;
      endDate?: string;
      type?: string;
      category?: string;
      groupBy?: 'Type' | 'Category' | 'month';
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      farmId,
      lotId,
      herdId,
      startDate,
      endDate,
      type,
      category,
      groupBy = 'Type',
    } = req.query;

    const where: any = { farmId: Number(farmId) };

    if (lotId) where.lotId = Number(lotId);
    if (herdId) where.herdId = Number(herdId);
    if (type) where.Type = type;
    if (category) where.Category = category;

    // Gestion des dates
    if (startDate || endDate) {
      where.date = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      };
    }

    let stats;

    if (groupBy === 'month') {
      stats = await prisma.production.groupBy({
        by: ['type', 'category', 'unit'],
        where,
        _sum: { quantity: true },
        _avg: { quantity: true },
        _count: { id: true },
        orderBy: { _sum: { quantity: 'desc' } },
      });

    } else {
      stats = await prisma.production.groupBy({
        by: ['type', 'unit', 'category'],
        where,
        _sum: { quantity: true },
        _avg: { quantity: true },
        _count: { id: true },
        orderBy: [
          { _sum: { quantity: 'desc' } },
          { type: 'asc' },
        ],
      });
    }

    // Statistiques globales supplémentaires
    const totalStats = await prisma.production.aggregate({
      where,
      _sum: { quantity: true },
      _count: { id: true },
      _avg: { quantity: true },
    });

    const responseData = {
      groupedStats: stats,
      total: {
        totalQuantity: totalStats._sum.quantity,
        totalRecords: totalStats._count.id,
        averageQuantity: totalStats._avg.quantity,
      },
      filters: {
        farmId: Number(farmId),
        period: { startDate, endDate },
      },
    };

    return ResponseApi.success(
      res,
      "Statistiques de production récupérées avec succès",
      200,
      responseData
    );
  } catch (error) {
    next(error);
  }
};
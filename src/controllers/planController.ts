// src/controllers/planController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// ======================================================
// CREATE Plan
// ======================================================
export const createPlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      name,
      code,
      description,
      priceMonthly,
      priceYearly,
      currency = "XOF",
      maxFarms,
      maxUsers,
      maxAnimals,
      features,
      isActive = true,
      isPublic = true,
      sortOrder = 0,
    } = req.body;

    if (!name || !code || priceMonthly === undefined) {
      return ResponseApi.error(
        res,
        "name, code et priceMonthly sont obligatoires",
        400,
      );
    }

    const existing = await prisma.plan.findUnique({
      where: { code: String(code).toLowerCase() },
    });
    if (existing) {
      return ResponseApi.error(res, "Ce code de plan existe déjà", 400);
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        code: String(code).toLowerCase(),
        description: description || null,
        priceMonthly: Number(priceMonthly),
        priceYearly:
          priceYearly !== undefined && priceYearly !== null
            ? Number(priceYearly)
            : null,
        currency,
        maxFarms: maxFarms !== undefined ? Number(maxFarms) : null,
        maxUsers: maxUsers !== undefined ? Number(maxUsers) : null,
        maxAnimals: maxAnimals !== undefined ? Number(maxAnimals) : null,
        features: features ?? null,
        isActive: Boolean(isActive),
        isPublic: Boolean(isPublic),
        sortOrder: Number(sortOrder) || 0,
      },
    });

    return ResponseApi.success(res, "Plan créé", 201, plan);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL Plans
// ======================================================
export const getAllPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const { isActive, isPublic, search } = req.query;

    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive === "true";
    if (isPublic !== undefined) where.isPublic = isPublic === "true";
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { code: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [plans, totalItems] = await Promise.all([
      prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: "asc" }, { priceMonthly: "asc" }],
      }),
      prisma.plan.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des plans", 200, {
      plans,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET Plan by ID
// ======================================================
export const getPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const plan = await prisma.plan.findUnique({
      where: { id: Number(id) },
    });

    if (!plan) {
      return ResponseApi.error(res, "Plan introuvable", 404);
    }

    return ResponseApi.success(res, "Plan trouvé", 200, plan);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Plan
// ======================================================
export const updatePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    if (data.code) {
      data.code = String(data.code).toLowerCase();
    }
    if (data.priceMonthly !== undefined) {
      data.priceMonthly = Number(data.priceMonthly);
    }
    if (data.priceYearly !== undefined) {
      data.priceYearly =
        data.priceYearly === null ? null : Number(data.priceYearly);
    }

    const plan = await prisma.plan.update({
      where: { id: Number(id) },
      data,
    });

    return ResponseApi.success(res, "Plan mis à jour", 200, plan);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Plan introuvable", 404);
    }
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Ce code de plan existe déjà", 400);
    }
    next(error);
  }
};

// ======================================================
// DELETE Plan
// ======================================================
export const deletePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    // Empêcher la suppression s'il y a des abonnements liés
    const count = await prisma.subscription.count({
      where: { planId: Number(id) },
    });
    if (count > 0) {
      return ResponseApi.error(
        res,
        "Impossible de supprimer un plan lié à des abonnements. Désactivez-le plutôt.",
        400,
      );
    }

    await prisma.plan.delete({ where: { id: Number(id) } });

    return ResponseApi.success(res, "Plan supprimé", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Plan introuvable", 404);
    }
    next(error);
  }
};

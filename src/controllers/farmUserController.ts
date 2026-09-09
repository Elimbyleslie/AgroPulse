import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";


async function assertFarmAccess(farmId: number, userId?: number) {
  const farm = await prisma.farm.findFirst({
    where: {
      id: farmId,
      organization: {
        OR: [{ ownerId: userId }, { users: { some: { id: userId } } }],
      },
    },
    select: { id: true },
  });
  return !!farm;
}

// CREATE — ajouter un user à une ferme
export const createFarmUser = async (
  req: Request<{}, {}, { farmId: number; userId: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, userId } = req.body;

    if (!farmId || !userId) {
      return ResponseApi.error(res, "farmId et userId sont obligatoires", 400);
    }

    const hasAccess = await assertFarmAccess(Number(farmId), req.user?.id);
    if (!hasAccess) {
      return ResponseApi.error(res, "Accès non autorisé à cette ferme", 403);
    }

    const farmUser = await prisma.farmUser.create({
      data: {
        farmId: Number(farmId),
        userId: Number(userId),
      },
      include: {
        farm: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true, status: true } },
      },
    });

    return ResponseApi.success(res, "Utilisateur ajouté à la ferme", 201, farmUser);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Cet utilisateur est déjà membre de cette ferme", 409);
    }
    if (error.code === "P2003") {
      return ResponseApi.error(res, "Ferme ou utilisateur introuvable", 404);
    }
    next(error);
  }
};

// GET ALL — avec filtres farmId / userId + pagination, scope sur les fermes accessibles
export const getAllFarmUsers = async (
  req: Request<
    {},
    {},
    {},
    { farmId?: string; userId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      farm: {
        organization: {
          OR: [
            { ownerId: req.user?.id },
            { users: { some: { id: req.user?.id } } },
          ],
        },
      },
    };
    if (req.query.farmId) where.farmId = Number(req.query.farmId);
    if (req.query.userId) where.userId = Number(req.query.userId);

    const [items, totalItems] = await Promise.all([
      prisma.farmUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: "desc" },
        include: {
          farm: { select: { id: true, name: true } },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              status: true,
              lastConnexion: true,
            },
          },
        },
      }),
      prisma.farmUser.count({ where }),
    ]);

    return ResponseApi.success(res, "Membres de ferme récupérés", 200, {
      items,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID — ownership check
export const getFarmUserById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmUser = await prisma.farmUser.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        farm: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    if (!farmUser) {
      return ResponseApi.error(res, "Affiliation non trouvée", 404);
    }

    const hasAccess = await assertFarmAccess(farmUser.farmId, req.user?.id);
    if (!hasAccess) {
      return ResponseApi.error(res, "Affiliation non trouvée", 404);
    }

    return ResponseApi.success(res, "Affiliation récupérée", 200, farmUser);
  } catch (error) {
    next(error);
  }
};

// GET BY FARM — tous les membres d'une ferme, ownership check
export const getFarmUsersByFarmId = async (
  req: Request<{ farmId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmId = Number(req.params.farmId);

    const hasAccess = await assertFarmAccess(farmId, req.user?.id);
    if (!hasAccess) {
      return ResponseApi.error(res, "Accès non autorisé à cette ferme", 403);
    }

    const items = await prisma.farmUser.findMany({
      where: { farmId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            lastConnexion: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return ResponseApi.success(res, "Membres de la ferme", 200, items);
  } catch (error) {
    next(error);
  }
};

// DELETE — retirer un user d'une ferme, ownership check
export const deleteFarmUser = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    const existing = await prisma.farmUser.findUnique({ where: { id } });
    if (!existing) {
      return ResponseApi.error(res, "Affiliation non trouvée", 404);
    }

    const hasAccess = await assertFarmAccess(existing.farmId, req.user?.id);
    if (!hasAccess) {
      return ResponseApi.error(res, "Affiliation non trouvée", 404);
    }

    const deleted = await prisma.farmUser.delete({ where: { id } });

    return ResponseApi.success(res, "Utilisateur retiré de la ferme", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Affiliation non trouvée", 404);
    }
    next(error);
  }
};
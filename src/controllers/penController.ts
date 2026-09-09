import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

/**
 * Créer un nouveau pen
 */
export const createPen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { barnId, name, capacity } = req.body;
    const userId = req.user?.id;

    if (!barnId || !name) {
      return ResponseApi.error(res, "BarnId et nom requis", 400);
    }

      const barn = await prisma.barn.findFirst({
      where: {
        id: Number(barnId),
        farm: {
          OR: [
            { managerId: userId },
            { organization: { users: { some: { id: userId } } } }
          ]
        }
      },
      include: { farm: true }
    });

    if (!barn) {
      return res.status(403).json({ 
        error: 'Accès non autorisé. Le bâtiment n\'appartient pas à vos fermes.' 
      });
    }

    const pen = await prisma.pen.create({
      data: {
        barnId: Number(barnId),
        name,
        capacity: capacity ? Number(capacity) : null,
      },
       include: {
        barn: {
          include: { farm: true }
        }
      }
    });

    ResponseApi.success(res, "Pen créé avec succès", 201, pen);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un pen par son id
 */
export const getPenById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const pen = await prisma.pen.findUnique({
      where: { id: Number(id) },
      include: {
        barn: true,
        movementsFrom: true,
        movementsTo: true,
      },
    });

    if (!pen) {
      return ResponseApi.error(res, "Pen non trouvé", 404);
    }

    ResponseApi.success(res, "Pen récupéré avec succès", 200, pen);
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les pens (avec pagination et recherche)
 */
// Backend - Route GET /pens
export const getAllPens = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId?: string;
      barnId?: string;
      search?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  const { farmId, barnId, search, page = 1, limit = 10 } = req.query;
  const userId = req.user?.id; // ID de l'utilisateur connecté

  try {
    const where: any = {};

    // Si barnId est fourni, filtrer directement
    if (barnId) {
      // Vérifier que le barn appartient à l'utilisateur
      const barn = await prisma.barn.findFirst({
        where: {
          id: Number(barnId),
          farm: {
            OR: [
              { managerId: userId },
              { organization: { users: { some: { id: userId } } } },
            ],
          },
        },
      });

      if (!barn) {
        return res
          .status(403)
          .json({ error: "Accès non autorisé à ce bâtiment" });
      }

      where.barnId = Number(barnId);
    }

    // Si farmId est fourni, filtrer par les barns de cette ferme
    if (farmId) {
      // Vérifier que la ferme appartient à l'utilisateur
      const farm = await prisma.farm.findFirst({
        where: {
          id: Number(farmId),
          OR: [
            { managerId: userId },
            { organization: { users: { some: { id: userId } } } },
          ],
        },
      });

      if (!farm) {
        return res
          .status(403)
          .json({ error: "Accès non autorisé à cette ferme" });
      }

      // Récupérer les IDs des barns de cette ferme
      const barns = await prisma.barn.findMany({
        where: { farmId: Number(farmId) },
        select: { id: true },
      });

      where.barnId = { in: barns.map((b) => b.id) };
    }

    // Si ni barnId ni farmId, retourner uniquement les pens des fermes de l'utilisateur
    if (!barnId && !farmId) {
      const userFarms = await prisma.farm.findMany({
        where: {
          OR: [
            { managerId: userId },
            { organization: { users: { some: { id: userId } } } },
          ],
        },
        select: { id: true },
      });

      const barns = await prisma.barn.findMany({
        where: { farmId: { in: userFarms.map((f) => f.id) } },
        select: { id: true },
      });

      where.barnId = { in: barns.map((b) => b.id) };
    }

    // Recherche par nom
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const pens = await prisma.pen.findMany({
      where,
      include: {
        barn: {
          include: {
            farm: true,
          },
        },
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.pen.count({ where });

    res.json({
      meta: { status: 200, message: "Liste des enclos récupérée" },
      data: {
        pens,
        pagination: {
          currentPage: Number(page),
          totalItems: total,
          totalPage: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Erreur récupération pens:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

/**
 * Mettre à jour un pen
 */
export const updatePen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { barnId } = req.body;
    const userId = req.user?.id;

       // Vérifier que le pen appartient à l'utilisateur
    const existingPen = await prisma.pen.findFirst({
      where: {
        id: Number(id),
        barn: {
          farm: {
            OR: [
              { managerId: userId },
              { organization: { users: { some: { id: userId } } } }
            ]
          }
        }
      }
    });

    if (!existingPen) {
      return res.status(403).json({ error: 'Accès non autorisé à cet enclos' });
    }

    // Si barnId change, vérifier le nouveau barn
    if (barnId && barnId !== existingPen.barnId) {
      const newBarn = await prisma.barn.findFirst({
        where: {
          id: Number(barnId),
          farm: {
            OR: [
              { managerId: userId },
              { organization: { users: { some: { id: userId } } } }
            ]
          }
        }
      });

      if (!newBarn) {
        return res.status(403).json({ error: 'Accès non autorisé au nouveau bâtiment' });
      }
    }

    const updatedPen = await prisma.pen.update({
      where: { id: Number(id) },
      data: req.body,
    });

    ResponseApi.success(res, "Pen mis à jour avec succès", 200, updatedPen);
  } catch (error: any) {
    if (error.code === "P2025") {
      ResponseApi.error(res, "Pen non trouvé", 404);
    } else {
      next(error);
    }
  }
};

/**
 * Supprimer un pen
 */
export const deletePen = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Vérifier que le pen appartient à l'utilisateur
        const pen = await prisma.pen.findFirst({
      where: {
        id: Number(id),
        barn: {
          farm: {
            OR: [
              { managerId: userId },
              { organization: { users: { some: { id:userId } } } }
            ]
          }
        }
      }
    });

    if (!pen) {
      return res.status(403).json({ error: 'Accès non autorisé à cet enclos' });
    }

    await prisma.pen.delete({
      where: { id: Number(id) },
    });

    ResponseApi.success(res, "Pen supprimé avec succès", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") {
      ResponseApi.error(res, "Pen non trouvé", 404);
    } else {
      next(error);
    }
  }
};

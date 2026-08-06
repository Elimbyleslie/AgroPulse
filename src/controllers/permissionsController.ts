import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Permission } from "../typages/usersRoles.js"

// CREATE
export const createPermission = async (
  req: Request<{}, {}, Permission>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, description } = req.body;

    if (!code?.trim() || !description?.trim()) {
      return ResponseApi.error(res, "code et description sont obligatoires", 400);
    }

    const permission = await prisma.permission.create({
      data: {
        code: code.trim().toLowerCase(),
        description: description.trim(),
      },
    });

    return ResponseApi.success(res, "Permission créée", 201, permission);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Ce code de permission existe déjà", 409);
    }
    next(error);
  }
};

// GET ALL
export const getAllPermissions = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string; search?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [permissions, totalItems] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: "asc" },
      }),
      prisma.permission.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des permissions", 200, {
      permissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getPermissionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id: Number(req.params.id) },
    });

    if (!permission) return ResponseApi.error(res, "Permission non trouvée", 404);
    return ResponseApi.success(res, "Permission récupérée", 200, permission);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updatePermission = async (
  req: Request<{ id: string }, {}, Partial<Permission>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, description } = req.body;
    const data: any = {};

    if (code !== undefined) data.code = code.trim().toLowerCase();
    if (description !== undefined) data.description = description.trim();

    const permission = await prisma.permission.update({
      where: { id: Number(req.params.id) },
      data,
    });

    return ResponseApi.success(res, "Permission mise à jour", 200, permission);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Permission non trouvée", 404);
    if (error.code === "P2002") return ResponseApi.error(res, "Ce code existe déjà", 409);
    next(error);
  }
};

// DELETE
export const deletePermission = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.permission.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "Permission supprimée", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Permission non trouvée", 404);
    next(error);
  }
};
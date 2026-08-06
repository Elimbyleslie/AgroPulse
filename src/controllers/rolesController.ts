import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { CreateRolePayload, UpdateRolePayload } from "../typages/usersRoles.js";

// CREATE
export const createRole = async (
  req: Request<{}, {}, CreateRolePayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, description, permissionIds } = req.body;

    if (!name?.trim()) {
      return ResponseApi.error(res, "Le nom du rôle est obligatoire", 400);
    }

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        permissions: permissionIds?.length
          ? {
              create: permissionIds.map((permissionId) => ({
                permissionId: Number(permissionId),
              })),
            }
          : undefined,
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return ResponseApi.success(res, "Rôle créé", 201, role);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Ce nom de rôle existe déjà", 409);
    }
    next(error);
  }
};

// GET ALL
export const getAllRoles = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string; search?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim();

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [roles, totalItems] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          permissions: { include: { permission: true } },
          _count: { select: { users: true } },
        },
      }),
      prisma.role.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des rôles", 200, {
      roles,
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
export const getRoleById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        permissions: { include: { permission: true } },
        users: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!role) return ResponseApi.error(res, "Rôle non trouvé", 404);
    return ResponseApi.success(res, "Rôle récupéré", 200, role);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateRole = async (
  req: Request<{ id: string }, {}, UpdateRolePayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roleId = Number(req.params.id);
    const { name, description, permissionIds } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description?.trim() || null;

    // Si permissionIds est fourni → on remplace toutes les permissions
    if (permissionIds !== undefined) {
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId: Number(permissionId),
          })),
        });
      }
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data,
      include: {
        permissions: { include: { permission: true } },
      },
    });

    return ResponseApi.success(res, "Rôle mis à jour", 200, role);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Rôle non trouvé", 404);
    if (error.code === "P2002") return ResponseApi.error(res, "Ce nom de rôle existe déjà", 409);
    next(error);
  }
};

// DELETE
export const deleteRole = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    await prisma.role.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "Rôle supprimé", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Rôle non trouvé", 404);
    next(error);
  }
};
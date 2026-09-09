import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AssignPermissionPayload } from "../typages/usersRoles.js";

// ASSIGN PERMISSION TO ROLE
export const assignPermissionToRole = async (
  req: Request<{}, {}, AssignPermissionPayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      return ResponseApi.error(res, "roleId et permissionId sont obligatoires", 400);
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: Number(roleId),
        permissionId: Number(permissionId),
      },
      include: {
        role: true,
        permission: true,
      },
    });

    return ResponseApi.success(res, "Permission assignée au rôle", 201, rolePermission);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Cette permission est déjà liée à ce rôle", 409);
    }
    if (error.code === "P2003") {
      return ResponseApi.error(res, "Rôle ou permission introuvable", 404);
    }
    next(error);
  }
};

// REMOVE PERMISSION FROM ROLE
export const removePermissionFromRole = async (
  req: Request<{}, {}, { roleId: number; permissionId: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { roleId, permissionId } = req.body;

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: Number(roleId),
          permissionId: Number(permissionId),
        },
      },
    });

    return ResponseApi.success(res, "Permission retirée du rôle", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Lien rôle-permission non trouvé", 404);
    }
    next(error);
  }
};

// GET PERMISSIONS OF A ROLE
export const getRolePermissions = async (
  req: Request<{ roleId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId: Number(req.params.roleId) },
      include: { permission: true },
    });

    return ResponseApi.success(res, "Permissions du rôle", 200, permissions);
  } catch (error) {
    next(error);
  }
};
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AssignRolePayload } from "../typages/usersRoles.js";

// ASSIGN ROLE TO USER
export const assignRoleToUser = async (
  req: Request<{}, {}, AssignRolePayload>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, roleId, assignedBy } = req.body;

    if (!userId || !roleId || !assignedBy) {
      return ResponseApi.error(res, "userId, roleId et assignedBy sont obligatoires", 400);
    }

    const userRole = await prisma.userRole.create({
      data: {
        userId: Number(userId),
        roleId: Number(roleId),
        assignedBy: String(assignedBy),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: true,
      },
    });

    return ResponseApi.success(res, "Rôle assigné à l'utilisateur", 201, userRole);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Cet utilisateur a déjà ce rôle", 409);
    }
    if (error.code === "P2003") {
      return ResponseApi.error(res, "Utilisateur ou rôle introuvable", 404);
    }
    next(error);
  }
};

// REMOVE ROLE FROM USER
export const removeRoleFromUser = async (
  req: Request<{}, {}, { userId: number; roleId: number }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId, roleId } = req.body;

    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: Number(userId),
          roleId: Number(roleId),
        },
      },
    });

    return ResponseApi.success(res, "Rôle retiré de l'utilisateur", 200, null);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Assignation non trouvée", 404);
    }
    next(error);
  }
};

// GET ROLES OF A USER
export const getUserRoles = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await prisma.userRole.findMany({
      where: { userId: Number(req.params.userId) },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    return ResponseApi.success(res, "Rôles de l'utilisateur", 200, roles);
  } catch (error) {
    next(error);
  }
};

// GET USERS OF A ROLE
export const getRoleUsers = async (
  req: Request<{ roleId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await prisma.userRole.findMany({
      where: { roleId: Number(req.params.roleId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            lastConnexion: true,
          },
        },
      },
    });

    return ResponseApi.success(res, "Utilisateurs du rôle", 200, users);
  } catch (error) {
    next(error);
  }
};
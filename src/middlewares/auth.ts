import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { Role } from "../typages/role.js";
import { Permission } from "../typages/permissions.js";
import env from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name?: string;
    email: string;
    role?: Role[];
    status?: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) return res.status(401).json({ error: "Token manquant." });

    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token manquant." });
    }

    const decoded = jwt.verify(token, env.accessTokenSecretKey!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id_user },
      select: {
        id: true,
        email: true,
        status: true,
        roles: {
          select: { role: true },
        },
      },
    });

    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ error: "Utilisateur invalide ou inactif." });
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    if (!roles.includes(req.user.role?.toString() || "")) {
      return res.status(403).json({
        error: "Accès interdit. Permissions insuffisantes.",
      });
    }

    next();
  };
};

export const authorizeRole = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const hasRole = req.user.role?.some((role) => roles.includes(role));

    if (!hasRole) {
      return res
        .status(403)
        .json({ error: "Accès interdit : rôle non autorisé." });
    }

    next();
  };
};

export const authorizePermission = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId)
        return res.status(401).json({ message: "Utilisateur non authentifié" });

      // récupère les rôles + permissions depuis Prisma
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          roles: {
            select: {
              role: {
                select: {
                  name: true,
                  permissions: {
                    select: {
                      permission: { select: { code: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user)
        return res.status(404).json({ message: "Utilisateur introuvable" });

      // Extraire les permissions
      const userPermissions = [
        ...new Set(
          user.roles.flatMap((ur: any) =>
            ur.role.permissions.map((p: any) => p.permission.code)
          )
        ),
      ];


      // Vérifier
      const hasPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasPermission)
        return res.status(403).json({ message: "Permission refusée" });

      next();
    } catch (error) {
      console.error("Erreur authorizePermission:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
};


import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { Role } from "../typages/role.js";
import {
  isPermissionCode,
  PermissionCode,
  Permission,
} from "../helpers/permissions.js";
import env from "../config/env.js";
import ResponseApi from "../helpers/response.js";

/**
 * ============================
 * AUTHENTICATION (JWT)
 * ============================
 */
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.path.startsWith("/auth")) {
      return next();
    }

    const authHeader = req.get("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "Token manquant." });
    }

    // ✅ Vérification du format "Bearer token"
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Format de token invalide." });
    }

    const token = authHeader.split(" ")[1]?.trim().replace(/['"]+/g, "");

    if (!token) {
      return res.status(401).json({ error: "Token manquant." });
    }

    // ✅ Vérification basique du format JWT (3 parties séparées par des points)
    if (token.split('.').length !== 3) {
      return res.status(401).json({ error: "Token malformé." });
    }

    const decoded = jwt.verify(token, env.accessTokenSecretKey!) as {
      id_user: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id_user },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.status !== "active") {
      return res.status(401).json({
        error: "Utilisateur invalide ou inactif.",
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name ?? undefined,
      status: user.status,
      roles: user.roles.map((r) => r.role.name),
    };

    next();
  } catch (error) {
    console.error("Erreur middleware authenticate:", error);
    
    // ✅ Gestion spécifique des erreurs JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Token invalide." });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expiré." });
    }
    
    return res
      .status(500)
      .json({ error: "Erreur interne lors de l'authentification." });
  }
};

/**
 * ============================
 * AUTHORIZE BY ROLE (simple)
 * ============================
 */
export const authorize = (roles: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non 0000" });
    }

    const hasRole = req.user.roles.some((r) => roles.includes(r));

    if (!hasRole) {
      return res.status(403).json({
        error: "Accès interdit. Permissions insuffisantes.",
      });
    }

    next();
  };
};

/**
 * ============================
 * AUTHORIZE BY ROLE ENUM
 * ============================
 */
export const authorizeRole = (roles: Role[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur yoooo" });
    }

    const hasRole = req.user.roles?.some((r) => roles.includes(r as Role));

    if (!hasRole) {
      return res
        .status(403)
        .json({ error: "Accès interdit : rôle non autorisé." });
    }

    next();
  };
};

/**
 * ============================
 * AUTHORIZE BY PERMISSIONS
 * ============================
 */
export const authorizePermission = (
  requiredPermissions: PermissionCode[],
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Utilisateur non yooo" });
      }

      // Récupère l'utilisateur avec ses permissions
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          roles: {
            select: {
              role: {
                select: {
                  permissions: {
                    select: {
                      permission: {
                        select: { code: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
      }

      // Valide et filtre les permissions de l'utilisateur
      const userPermissions = new Set<PermissionCode>();

      user.roles.forEach((ur) => {
        ur.role.permissions.forEach((rp) => {
          const code = rp.permission.code;
          if (isPermissionCode(code)) {
            userPermissions.add(code);
          }
        });
      });

      // Vérifie que toutes les permissions requises sont présentes
      const hasPermission = requiredPermissions.every((perm) =>
        userPermissions.has(perm),
      );

      if (!hasPermission) {
        return res.status(403).json({ message: "Permission refusée" });
      }

      next();
    } catch (error) {
      console.error("Erreur authorizePermission:", error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
};

export const getDashboardStatus = async (req: Request, res: Response) => {
  const user = req.user;

  if (user?.roles?.includes("FARM_MANAGER")) {
    // Manager : peut créer / gérer
    const farmCount = await prisma.farm.count({
      where: { managerId: user.id },
    });
    return ResponseApi.success(res, "Dashboard status", 200, {
      role: user.roles,
      canCreateFarm: true,
      hasFarm: farmCount > 0,
    });
  }

  if (user?.roles?.includes("FARMER")) {
    // Membre : pas de création de ferme, seulement accès affilié
    const affiliationCount = await prisma.farmUser.count({
      where: { userId: user.id },
    });
    return ResponseApi.success(res, "Dashboard status", 200, {
      role: user.roles,
      canCreateFarm: false,
      hasFarm: false,
      isAffiliated: affiliationCount > 0,
    });
  }

  return ResponseApi.error(res, "Rôle inconnu", 403);
};

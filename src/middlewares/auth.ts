import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../models/prismaClient.js";
import { Role } from "../typages/role.js";
import { isPermissionCode, PermissionCode, Permission } from "../helpers/permissions.js";
import env from "../config/env.js";

/**
 * ============================
 * AUTHENTICATION (JWT)
 * ============================
 */
export const authenticate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "Token manquant." });
    }

    const token = authHeader.replace(/^Bearer\s+/i, "");

    if (!token) {
      return res.status(401).json({ error: "Token manquant." });
    }

    const decoded = jwt.verify(
      token,
      env.accessTokenSecretKey!
    ) as { id_user: number };

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

    // ✅ Grâce à express.d.ts
  req.user = {
  id: user.id,
  email: user.email,
  name: user.name ?? undefined,
  status: user.status,
  roles: user.roles.map((r) => r.role.name),
};


    next();
  } catch (error) {
    return res.status(401).json({ error: "Token invalide" });
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
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const hasRole = req.user.roles.some(r => roles.includes(r));

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
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const hasRole = req.user.roles?.some((r) =>
      roles.includes(r as Role)
    );

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
  requiredPermissions: PermissionCode[]
): RequestHandler => {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
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
        userPermissions.has(perm)
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


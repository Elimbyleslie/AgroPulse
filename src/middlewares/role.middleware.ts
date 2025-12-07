import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";

/**
 * Middleware qui vérifie si l'utilisateur connecté est un administrateur
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // On suppose que le middleware `authenticate` a déjà ajouté l'utilisateur à req.user
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Cherche les rôles de l’utilisateur
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const roleNames = userRoles.map((ur :{ role: { name: string; }; }) => ur.role.name.toLowerCase());

    // Vérifie si l'utilisateur a un rôle admin
    if (!roleNames.includes("admin")) {
      return res.status(403).json({ error: "Accès refusé. Vous devez être administrateur." });
    }

    next();
  } catch (error: any) {
    console.error("Erreur middleware isAdmin:", error);
    return res.status(500).json({ error: "Erreur interne lors de la vérification du rôle" });
  }
};

/** Middleware qui vérifie si l'utilisateur connecté est un gestionnaire
 */
export const isManager = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;        
    if (!userId) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }       
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },  
    });

    const roleNames = userRoles.map((ur :{ role: { name: string; }; }) => ur.role.name.toLowerCase());
    if (!roleNames.includes("manager")) {
      return res.status(403).json({ error: "Accès refusé. Vous devez être gestionnaire." });
    }
    next();
  } catch (error: any) {    
    console.error("Erreur middleware isManager:", error);
    return res.status(500).json({ error: "Erreur interne lors de la vérification du rôle" });
  } 
};
/** Middleware qui vérifie si l'utilisateur connecté est un employé
 */
export const isEmployee = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }
        const userRoles = await prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
        const roleNames = userRoles.map((ur :{ role: { name: string; }; }) => ur.role.name.toLowerCase());
        if (!roleNames.includes("employee")) {
            return res.status(403).json({ error: "Accès refusé. Vous devez être employé." });
        }
        next();
    }
    catch (error: any) {
        console.error("Erreur middleware isEmployee:", error);
        return res.status(500).json({ error: "Erreur interne lors de la vérification du rôle" });
    }
};

export const hasRole = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }
        const userRoles = await prisma.userRole.findMany({
            where: { userId },
            include: { role: true },
        });
        const roleNames = userRoles.map((ur : { role: { name: string; }; }) => ur.role.name.toLowerCase());
        const hasRequiredRole = requiredRoles.some(role => roleNames.includes(role.toLowerCase()));
        if (!hasRequiredRole) {
            return res.status(403).json({ error: `Accès refusé. Rôle requis: ${requiredRoles.join(', ')}` });
        }
        next();
    }
    catch (error: any) {
        console.error("Erreur middleware hasRole:", error);
        return res.status(500).json({ error: "Erreur interne lors de la vérification du rôle" });
    }
    };
};


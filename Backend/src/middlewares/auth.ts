
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id_user: number;
    nom: string;
    email: string;
    role: string;
    statut: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.utilisateurs.findUnique({
      where: { id_user: decoded.id_user },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        statut: true
      }
    });

    if (!user || user.statut !== 'ACTIF') {
      return res.status(401).json({ error: 'Token invalide ou utilisateur inactif' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur authentication:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Accès interdit. Permissions insuffisantes.' 
      });
    }

    next();
  };
};
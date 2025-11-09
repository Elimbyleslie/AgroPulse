
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    name?: string;
    email: string;
    userRoles?: number[];
    status?: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id_user },
      select: {
        id: true,
        name: true,
        email: true,
        userRoles: true,
        status: true
      }
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Token invalide ou utilisateur inactif' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      userRoles: user.userRoles[0].roleId ? user.userRoles.map(ur => ur.roleId) : [],
      status: user.status
    };
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

    if (!roles.includes(req.user.userRoles?.toString() || '')) {
      return res.status(403).json({ 
        error: 'Accès interdit. Permissions insuffisantes.' 
      });
    }

    next();
  };
};
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

// Middleware pour les routes non trouvées
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: `Route non trouvée - ${req.method} ${req.originalUrl}`
  });
};

// Gestionnaire d'erreurs principal
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Erreur:', error);

  // Erreur Prisma - Entrée dupliquée
  if (error.code === 'P2002') {
    return res.status(400).json({
      error: 'Cette valeur existe déjà'
    });
  }

  // Erreur Prisma - Enregistrement non trouvé
  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Enregistrement non trouvé'
    });
  }

  // Erreur Prisma - Violation clé étrangère
  if (error.code === 'P2003') {
    return res.status(400).json({
      error: 'Impossible de supprimer, des données sont liées'
    });
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide'
    });
  }

  // Erreur de validation
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: error.message
    });
  }

  // Erreur par défaut
  res.status(500).json({
    error: 'Erreur serveur'
  });
};

// Wrapper pour les controllers async
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
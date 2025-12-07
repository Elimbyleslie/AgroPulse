
// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import {JwtPayload,Role} from '../typages/role.js';

// export interface AuthenticatedRequest extends Request {
//   user?: JwtPayload;
// }

// export const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//  const authHeader = req.headers.authorization as string | undefined;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ error: 'Token manquant. Accès refusé.' });
//   }

//   const token = authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Token invalide.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
//     req.user = decoded;
//     next();
//   } catch (error: any) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token expiré.' });
//     }
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ error: 'Token invalide.' });
//     }
//     return res.status(401).json({ error: 'Échec de l\'authentification.' });
//   }
// };

// // Middleware pour vérifier les rôles
// export const requireRole = (roles: Role[]) => {
//   return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Utilisateur non authentifié.' });
//     }

//     const userRole = req.user.role;

//     if (!roles.includes(userRole)) {
//       return res.status(403).json({
//         error: `Accès refusé. Rôles requis : ${roles.join(', ')}`,
//       });
//     }

//     next();
//   };
// };

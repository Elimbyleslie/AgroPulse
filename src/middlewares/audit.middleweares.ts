
import { Request, Response, NextFunction } from 'express';
import { logAction } from '../controllers/audit.controller.js';
import { AnyARecord } from 'dns';

export const auditMiddleware = (tableCible: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    const userId = (req as any).user?.id_user;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Intercepter la réponse pour logger après l'action
    res.send = function (data: any): Response {
      const action = getActionFromMethod(req.method);
      const idCible = getTargetId(req);

      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Logger l'action en arrière-plan
        logAction({
          utilisateur_id: userId,
          ferme_id: getFermeIdFromRequest(req),
          table_cible: tableCible,
          id_cible: idCible,
          action: action,
          anciennes_valeurs: getOldValues(req.method, data),
          nouvelles_valeurs: getNewValues(req.method, req.body),
          ip_address: ipAddress
        }).catch(console.error);
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// Helper functions
const getActionFromMethod = (method: string): string => {
  const actions: { [key: string]: string } = {
    'GET': 'consultation',
    'POST': 'creation',
    'PUT': 'modification',
    'PATCH': 'modification',
    'DELETE': 'suppression'
  };
  return actions[method] || 'autre';
};

const getTargetId = (req: Request): number | undefined => {
  if (req.params.id) {
    return Number(req.params.id);
  }
  return undefined;
};

const getFermeIdFromRequest = (req: Request): number | undefined => {
  
  return req.body.ferme_id || undefined;
};

const getOldValues = (method: string, data: any): any => {
  if (method === 'PUT' || method === 'PATCH') {
    
    return null; 
  }
  return null;
};

const getNewValues = (method: string, body: any): any => {
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    return body;
  }
  return null;
};
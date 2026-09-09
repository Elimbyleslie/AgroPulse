import { Request, Response, NextFunction } from "express";
import { logAction } from "../controllers/audit.controller.js";
import { AnyARecord } from "dns";
/**
 * Middleware d'audit automatique
 * @param tableTarget 
 */
export const auditMiddleware = (tableTarget: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sauvegarde des méthodes originales
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const userId = (req as any).user?.id ?? null;
    const organizationId = (req as any).user?.organizationId ?? null;
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;

    const doLog = (statusCode: number) => {
      if (statusCode < 200 || statusCode >= 300) return;

      const action = getActionFromMethod(req.method);
      const recordId = getTargetId(req);
      const farmId = getFarmIdFromRequest(req);

      logAction({
        userId,
        organizationId,
        farmId,
        tableTarget,
        action,
        recordId,
        description: `${action} on ${tableTarget}${recordId ? ` #${recordId}` : ""}`,
        ipAddress,
        userAgent,
      }).catch((err) => {
        console.error("Erreur auditMiddleware:", err);
      });
    };

    res.json = function (body: any): Response {
      doLog(res.statusCode || 200);
      return originalJson(body);
    };

    res.send = function (body: any): Response {
      doLog(res.statusCode || 200);
      return originalSend(body);
    };

    next();
  };
};

// ====================== HELPERS ======================

function getActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case "POST":
      return "CREATE";
    case "PUT":
    case "PATCH":
      return "UPDATE";
    case "DELETE":
      return "DELETE";
    case "GET":
      return "READ";
    default:
      return method.toUpperCase();
  }
}

function getTargetId(req: Request): number | null {
  if (req.params.id) {
    const id = Number(req.params.id);
    return isNaN(id) ? null : id;
  }

  if (req.body?.id) {
    const id = Number(req.body.id);
    return isNaN(id) ? null : id;
  }

  return null;
}

function getFarmIdFromRequest(req: Request): number | null {

  if (req.body?.farmId) {
    const id = Number(req.body.farmId);
    return isNaN(id) ? null : id;
  }

  if (req.query?.farmId) {
    const id = Number(req.query.farmId);
    return isNaN(id) ? null : id;
  }

  if (req.params?.farmId) {
    const id = Number(req.params.farmId);
    return isNaN(id) ? null : id;
  }

  if ((req as any).user?.farmId) {
    return (req as any).user.farmId;
  }

  return null;
}

export const getFermeIdFromRequest = (req: Request): number | undefined => {
  return req.body.ferme_id || undefined;
};

export const getOldValues = (method: string, data: any): any => {
  if (method === "PUT" || method === "PATCH") {
    return null;
  }
  return null;
};

export const getNewValues = (method: string, body: any): any => {
  if (method === "POST" || method === "PUT" || method === "PATCH") {
    return body;
  }
  return null;
};

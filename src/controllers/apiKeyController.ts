import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

export const createApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = await prisma.apiKey.create({ data: req.body, include: { organization: true } });
    return ResponseApi.success(res, "API Key créée", 201, apiKey);
  } catch (error) { next(error); }
};

export const getAllApiKeys = async (req: Request<{}, {}, {}, { organizationId?: string; page?: string; limit?: string }>, res: Response, next: NextFunction) => {
  try {
    const { organizationId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (organizationId) where.organizationId = Number(organizationId);

    const apiKeys = await prisma.apiKey.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: { organization: true } });
    const totalItems = await prisma.apiKey.count({ where });

    return ResponseApi.success(res, "Liste des API Keys récupérée", 200, {
      apiKeys,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) { next(error); }
};

// GET BY ID
export const getApiKeyById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const apiKey = await prisma.apiKey.findUnique({ where: { id: Number(req.params.id) }, include: { organization: true } });
    if (!apiKey) return ResponseApi.error(res, "API Key non trouvée", 404);
    return ResponseApi.success(res, "API Key récupérée", 200, apiKey);
  } catch (error) { next(error); }
};

// UPDATE
export const updateApiKey = async (req: Request<{ id: string }, {}, any>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.apiKey.update({ where: { id: Number(req.params.id) }, data: req.body, include: { organization: true } });
    return ResponseApi.success(res, "API Key mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "API Key non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteApiKey = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.apiKey.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "API Key supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "API Key non trouvée", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createFinancialReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const report = await prisma.financialReport.create({
      data: req.body,
      include: { farm: true },
    });

    return ResponseApi.success(res, "Rapport financier créé", 201, report);
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllFinancialReports = async (
  req: Request<
    {},
    {},
    {},
    { farmId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmId) where.farmId = Number(farmId);

    const reports = await prisma.financialReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { farm: true },
    });

    const totalItems = await prisma.financialReport.count({ where });

    return ResponseApi.success(
      res,
      "Liste des rapports financiers récupérée",
      200,
      {
        reports,
        pagination: {
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page * limit < totalItems ? page + 1 : null,
          totalItems,
          totalPage: Math.ceil(totalItems / limit),
        },
      }
    );
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getFinancialReportById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const report = await prisma.financialReport.findUnique({
      where: { id: Number(req.params.id) },
      include: { farm: true },
    });

    if (!report)
      return ResponseApi.error(res, "Rapport financier non trouvé", 404);

    return ResponseApi.success(res, "Rapport financier récupéré", 200, report);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateFinancialReport = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.financialReport.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { farm: true },
    });

    return ResponseApi.success(
      res,
      "Rapport financier mis à jour",
      200,
      updated
    );
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Rapport financier non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteFinancialReport = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.financialReport.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(
      res,
      "Rapport financier supprimé",
      200,
      deleted
    );
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Rapport financier non trouvé", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Sale } from "../typages/expenseSale.js";

// CREATE
export const createSale = async (
  req: Request<{}, {}, Sale>,
  res: Response,
  next: NextFunction
) => {
  try {
    const sale = await prisma.sale.create({
      data: req.body,
      include: { saleItems: true, payments: true, farm: true },
    });
    return ResponseApi.success(res, "Vente créée", 201, sale);
  } catch (error) {
    next(error);
  }
};

// GET ALL avec pagination et filtre par farmId
export const getAllSales = async (
  req: Request<{}, {}, {}, { farmId?: string; page?: string; limit?: string }>,
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

    const sales = await prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { saleItems: true, payments: true, farm: true },
    });

    const totalItems = await prisma.sale.count({ where });

    return ResponseApi.success(res, "Liste des ventes récupérée", 200, {
      sales,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getSaleById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(req.params.id) },
      include: { saleItems: true, payments: true, farm: true },
    });
    if (!sale) return ResponseApi.error(res, "Vente non trouvée", 404);
    return ResponseApi.success(res, "Vente récupérée", 200, sale);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateSale = async (
  req: Request<{ id: string }, {}, Partial<Sale>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.sale.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { saleItems: true, payments: true, farm: true },
    });
    return ResponseApi.success(res, "Vente mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Vente non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteSale = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.sale.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Vente supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Vente non trouvée", 404);
    next(error);
  }
};

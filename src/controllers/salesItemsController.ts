import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { SaleItem } from "../typages/expenseSale.js";

// CREATE
export const createSaleItem = async (
  req: Request<{}, {}, SaleItem>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await prisma.saleItem.create({
      data: req.body,
      include: { sale: true, lot: true, animal: true, production: true },
    });
    return ResponseApi.success(res, "Item de vente créé", 201, item);
  } catch (error) {
    next(error);
  }
};

// GET ALL avec pagination et filtre par saleId, lotId, animalId
export const getAllSaleItems = async (
  req: Request<
    {},
    {},
    {},
    {
      saleId?: string;
      lotId?: string;
      animalId?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { saleId, lotId, animalId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (saleId) where.saleId = Number(saleId);
    if (lotId) where.lotId = Number(lotId);
    if (animalId) where.animalId = Number(animalId);

    const items = await prisma.saleItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: { sale: true, lot: true, animal: true, production: true },
    });

    const totalItems = await prisma.saleItem.count({ where });

    return ResponseApi.success(res, "Liste des items de vente récupérée", 200, {
      items,
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
export const getSaleItemById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await prisma.saleItem.findUnique({
      where: { id: Number(req.params.id) },
      include: { sale: true, lot: true, animal: true, production: true },
    });
    if (!item) return ResponseApi.error(res, "Item de vente non trouvé", 404);
    return ResponseApi.success(res, "Item de vente récupéré", 200, item);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateSaleItem = async (
  req: Request<{ id: string }, {}, Partial<SaleItem>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.saleItem.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: { sale: true, lot: true, animal: true, production: true },
    });
    return ResponseApi.success(res, "Item de vente mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Item de vente non trouvé", 404);
    next(error);
  }
};

// DELETE
export const deleteSaleItem = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.saleItem.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Item de vente supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Item de vente non trouvé", 404);
    next(error);
  }
};

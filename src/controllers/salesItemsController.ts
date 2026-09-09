import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { SaleItem } from "../typages/expenseSale.js";

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createSaleItem = async (
  req: Request<{}, {}, SaleItem>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      saleId,
      productName,
      category,
      unit,
      quantity,
      unitPrice,
      totalPrice,
      discount,
      productionId,
      lotId,
      animalId,
      notes,
    } = req.body;

    const data: any = {
      saleId: Number(saleId),
      productName: productName?.trim(),
      category,
      unit: unit?.trim() || "unité",
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice: Number(totalPrice),
      discount: discount != null ? Number(discount) : 0,
      notes: notes?.trim() || null,
    };

    if (productionId != null) data.productionId = Number(productionId);
    if (lotId != null) data.lotId = Number(lotId);
    if (animalId != null) data.animalId = Number(animalId);

    const item = await prisma.saleItem.create({
      data,
      include: {
        sale: { select: { id: true, date: true, total: true, status: true } },
        lot: { select: { id: true, name: true } },
        animal: { select: { id: true, name: true } },
        production: {
          select: { id: true, type: true, unit: true, category: true },
        },
      },
    });

    return ResponseApi.success(res, "Item de vente créé", 201, item);
  } catch (error) {
    next(error);
  }
};

// ── GET ALL ───────────────────────────────────────────────────────────────────
export const getAllSaleItems = async (
  req: Request<
    {},
    {},
    {},
    {
      saleId?: string;
      lotId?: string;
      animalId?: string;
      productionId?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { saleId, lotId, animalId, productionId, page, limit } = req.query;

    const currentPage = Number(page) || 1;
    const take = Number(limit) || 10;
    const skip = (currentPage - 1) * take;

    const where: any = {};
    if (saleId) where.saleId = Number(saleId);
    if (lotId) where.lotId = Number(lotId);
    if (animalId) where.animalId = Number(animalId);
    if (productionId) where.productionId = Number(productionId);

    const [items, totalItems] = await Promise.all([
      prisma.saleItem.findMany({
        where,
        skip,
        take,
        orderBy: { id: "desc" },
        include: {
          sale: { select: { id: true, date: true, total: true, status: true } },
          lot: { select: { id: true, name: true } },
          animal: { select: { id: true, name: true } },
          production: {
            select: { id: true, type: true, unit: true, category: true },
          },
        },
      }),
      prisma.saleItem.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des items de vente récupérée", 200, {
      items,
      pagination: {
        currentPage,
        previousPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage * take < totalItems ? currentPage + 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET BY ID ─────────────────────────────────────────────────────────────────
export const getSaleItemById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const item = await prisma.saleItem.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        sale: true,
        lot: true,
        animal: true,
        production: true,
      },
    });

    if (!item) {
      return ResponseApi.error(res, "Item de vente non trouvé", 404);
    }

    return ResponseApi.success(res, "Item de vente récupéré", 200, item);
  } catch (error) {
    next(error);
  }
};

// ── GET BY SALE ID ────────────────────────────────────────────────────────────
export const getSaleItemsBySaleId = async (
  req: Request<{ saleId: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const saleId = Number(req.params.saleId);

    const items = await prisma.saleItem.findMany({
      where: { saleId },
      orderBy: { id: "asc" },
      include: {
        lot: { select: { id: true, name: true } },
        animal: { select: { id: true, name: true } },
        production: {
          select: { id: true, type: true, unit: true, category: true },
        },
      },
    });

    return ResponseApi.success(res, "Articles de la vente récupérés", 200, items);
  } catch (error) {
    next(error);
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateSaleItem = async (
  req: Request<{ id: string }, {}, Partial<SaleItem>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      productName,
      category,
      unit,
      quantity,
      unitPrice,
      totalPrice,
      discount,
      productionId,
      lotId,
      animalId,
      notes,
    } = req.body;

    const data: any = {};

    if (productName !== undefined) data.productName = productName.trim();
    if (category !== undefined) data.category = category;
    if (unit !== undefined) data.unit = unit.trim() || "unité";
    if (quantity !== undefined) data.quantity = Number(quantity);
    if (unitPrice !== undefined) data.unitPrice = Number(unitPrice);
    if (totalPrice !== undefined) data.totalPrice = Number(totalPrice);
    if (discount !== undefined) data.discount = Number(discount);
    if (notes !== undefined) data.notes = notes?.trim() || null;

    if (productionId !== undefined) {
      data.productionId = productionId != null ? Number(productionId) : null;
    }
    if (lotId !== undefined) {
      data.lotId = lotId != null ? Number(lotId) : null;
    }
    if (animalId !== undefined) {
      data.animalId = animalId != null ? Number(animalId) : null;
    }

    const updated = await prisma.saleItem.update({
      where: { id: Number(req.params.id) },
      data,
      include: {
        sale: true,
        lot: true,
        animal: true,
        production: true,
      },
    });

    return ResponseApi.success(res, "Item de vente mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Item de vente non trouvé", 404);
    }
    next(error);
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteSaleItem = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deleted = await prisma.saleItem.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(res, "Item de vente supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Item de vente non trouvé", 404);
    }
    next(error);
  }
};
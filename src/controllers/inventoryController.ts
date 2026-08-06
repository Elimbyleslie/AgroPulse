import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Inventory, InventoryCategory } from "../typages/inventory.js"; // Adaptez le chemin

// CREATE - Ajout d'un nouvel article en stock
export const createInventory = async (
  req: Request<{}, {}, Inventory>,
  res: Response,
  next: NextFunction
) => {
  try {
    const inventory = await prisma.inventory.create({
      data: req.body,
      include: {
        farm: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
      },
    });

    return ResponseApi.success(res, "Article ajouté au stock avec succès", 201, inventory);
  } catch (error) {
    next(error);
  }
};

// GET ALL - Avec pagination et filtres avancés
export const getAllInventory = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId?: string;
      category?: InventoryCategory;
      status?: string;
      supplierId?: string;
      location?: string;
      lowStock?: string; // Pour afficher seulement les stocks bas
      search?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      category,
      status,
      supplierId,
      location,
      lowStock,
      search,
      page,
      limit,
    } = req.query;

    const currentPage = Number(page) || 1;
    const take = Number(limit) || 20;
    const skip = (currentPage - 1) * take;

    const where: any = {};

    if (farmId) where.farmId = Number(farmId);
    if (category) where.category = category;
    if (status) where.status = status;
    if (supplierId) where.supplierId = Number(supplierId);
    if (location) where.location = location;

    const lowStockFilter = lowStock === "true";
    if (lowStockFilter) {
      where.minQuantity = { not: null };
    }

    // Recherche par nom ou SKU
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    let items: any[];
    let totalItems: number;

    if (lowStockFilter) {
      const allItems = await prisma.inventory.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        include: {
          farm: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });

      const lowStockItems = allItems.filter(
        (item) => item.minQuantity !== null && item.quantity <= item.minQuantity
      );

      totalItems = lowStockItems.length;
      items = lowStockItems.slice(skip, skip + take);
    } else {
      [items, totalItems] = await Promise.all([
        prisma.inventory.findMany({
          where,
          skip,
          take,
          orderBy: { updatedAt: "desc" },
          include: {
            farm: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true } },
          },
        }),
        prisma.inventory.count({ where }),
      ]);
    }

    return ResponseApi.success(res, "Liste du stock récupérée", 200, {
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

// GET BY ID
export const getInventoryById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const item = await prisma.inventory.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        farm: true,
        supplier: true,
        movements: {
          orderBy: { date: "desc" },
          take: 10, // Derniers 10 mouvements
        },
      },
    });

    if (!item) {
      return ResponseApi.error(res, "Article non trouvé", 404);
    }

    return ResponseApi.success(res, "Article récupéré", 200, item);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateInventory = async (
  req: Request<{ id: string }, {}, Partial<Inventory>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.inventory.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: {
        farm: true,
        supplier: true,
      },
    });

    return ResponseApi.success(res, "Stock mis à jour avec succès", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Article non trouvé", 404);
    }
    next(error);
  }
};

// DELETE
export const deleteInventory = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.inventory.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(res, "Article supprimé du stock", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Article non trouvé", 404);
    }
    next(error);
  }
};
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Supplier } from "../typages/feed.js";


// ======================================================
// CREATE SUPPLIER
// ======================================================
export const createFeedSupplier = async (
  req: Request<{}, {}, Supplier>,
  res: Response,
  next: NextFunction
) => {
  try {
  

    const supplier = await prisma.supplier.create({
      data: req.body,
    });

    return ResponseApi.success(
      res,
      "Fournisseur créé avec succès",
      201,
      supplier
    );
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET ALL SUPPLIERS
// ======================================================
export const getAllFeedSuppliers = async (
  req: Request<{}, {}, {}, { page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const suppliers = await prisma.supplier.findMany({
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        purchases: true,
      },
    });

    const totalItems = await prisma.supplier.count();

    return ResponseApi.success(res, "Liste des fournisseurs récupérée", 200, {
      suppliers,
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

// ======================================================
// GET SUPPLIER BY ID
// ======================================================
export const getFeedSupplierById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
      include: { purchases: true },
    });

    if (!supplier)
      return ResponseApi.error(res, "Fournisseur non trouvé", 404);

    return ResponseApi.success(res, "Fournisseur récupéré", 200, supplier);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE SUPPLIER
// ======================================================
export const updateFeedSupplier = async (
  req: Request<{ id: string }, {}, Partial<Supplier>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const updated = await prisma.supplier.update({
      where: { id: Number(id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Fournisseur mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Fournisseur non trouvé", 404);
    next(error);
  }
};

// ======================================================
// DELETE SUPPLIER
// ======================================================
export const deleteFeedSupplier = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id)))
      return ResponseApi.error(res, "ID invalide", 400);

    const deleted = await prisma.supplier.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Fournisseur supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Fournisseur non trouvé", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { ExpenseCategory } from "../typages/expenseSale.js";

// CREATE
export const createExpenseCategory = async (req: Request<{}, {}, ExpenseCategory>, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.expenseCategory.create({ data: req.body });
    return ResponseApi.success(res, "Catégorie créée", 201, category);
  } catch (error) {
    next(error);
  }
};

// GET ALL avec pagination et filtre par name
export const getAllExpenseCategories = async (
  req: Request<{}, {}, {}, { search?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.name = { contains: search, mode: "insensitive" };

    const categories = await prisma.expenseCategory.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: { expenses: true },
    });

    const totalItems = await prisma.expenseCategory.count({ where });

    return ResponseApi.success(res, "Liste des catégories récupérée", 200, {
      categories,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getExpenseCategoryById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const category = await prisma.expenseCategory.findUnique({ where: { id: Number(req.params.id) }, include: { expenses: true } });
    if (!category) return ResponseApi.error(res, "Catégorie non trouvée", 404);
    return ResponseApi.success(res, "Catégorie récupérée", 200, category);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateExpenseCategory = async (req: Request<{ id: string }, {}, Partial<ExpenseCategory>>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.expenseCategory.update({ where: { id: Number(req.params.id) }, data: req.body });
    return ResponseApi.success(res, "Catégorie mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Catégorie non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteExpenseCategory = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.expenseCategory.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "Catégorie supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Catégorie non trouvée", 404);
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Expense } from "../typages/expenseSale.js";

// CREATE
export const createExpense = async (req: Request<{}, {}, Expense>, res: Response, next: NextFunction) => {
  try {
    const expense = await prisma.expense.create({ data: req.body });
    return ResponseApi.success(res, "Dépense créée", 201, expense);
  } catch (error) {
    next(error);
  }
};

// GET ALL avec pagination et filtre par farmId et categoryId
export const getAllExpenses = async (
  req: Request<{}, {}, {}, { farmId?: string; categoryId?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, categoryId } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (categoryId) where.categoryId = Number(categoryId);

    const expenses = await prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: { farm: true, category: true },
    });

    const totalItems = await prisma.expense.count({ where });

    return ResponseApi.success(res, "Liste des dépenses récupérée", 200, {
      expenses,
      pagination: { currentPage: page, previousPage: page > 1 ? page - 1 : null, nextPage: page * limit < totalItems ? page + 1 : null, totalItems, totalPage: Math.ceil(totalItems / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getExpenseById = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: Number(req.params.id) }, include: { farm: true, category: true } });
    if (!expense) return ResponseApi.error(res, "Dépense non trouvée", 404);
    return ResponseApi.success(res, "Dépense récupérée", 200, expense);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateExpense = async (req: Request<{ id: string }, {}, Partial<Expense>>, res: Response, next: NextFunction) => {
  try {
    const updated = await prisma.expense.update({ where: { id: Number(req.params.id) }, data: req.body });
    return ResponseApi.success(res, "Dépense mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Dépense non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteExpense = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const deleted = await prisma.expense.delete({ where: { id: Number(req.params.id) } });
    return ResponseApi.success(res, "Dépense supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") return ResponseApi.error(res, "Dépense non trouvée", 404);
    next(error);
  }
};

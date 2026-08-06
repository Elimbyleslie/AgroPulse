import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Expense , ExpenseCategory, PaymentMethod } from "../typages/expenseSale.js";

// CREATE
// CREATE - expensesController.ts
export const createExpense = async (
  req: Request<{}, {}, Expense>,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("[Backend] Données reçues dans req.body :", req.body);

    const { notes, date, amount, farmId, category, supplierId, paymentMethod, ...rest } = req.body;

    if (!category) {
      return ResponseApi.error(res, "Le champ 'category' est obligatoire (ex: FEED, VET, MAINTENANCE...)", 400);
    }

    const expenseData = {
      notes: notes || "",
      date: date ? new Date(date) : new Date(),
      amount: Number(amount),
      farmId: Number(farmId),
      category,                    // ExpenseCategory enum
      supplierId: supplierId ? Number(supplierId) : null,
      paymentMethod: paymentMethod || "CASH",
      ...rest
    };

    const expense = await prisma.expense.create({
      data: expenseData,
      include: {
        farm: true,
        supplier: true,
        createdBy: true,
      },
    });

    return ResponseApi.success(res, "Dépense créée avec succès", 201, expense);
  } catch (error) {
    next(error);
  }
};

// GET ALL - avec pagination + filtres
export const getAllExpenses = async (
  req: Request<
    {},
    {},
    {},
    {
      farmId?: string;
      category?: ExpenseCategory;
      startDate?: string;
      endDate?: string;
      paymentMethod?: PaymentMethod;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, category, startDate, endDate, paymentMethod, page, limit } = req.query;

    const currentPage = Number(page) || 1;
    const take = Number(limit) || 10;
    const skip = (currentPage - 1) * take;

    const where: any = {};

    if (farmId) where.farmId = Number(farmId);
    if (category) where.category = category;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    // Filtre par plage de dates
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [expenses, totalItems] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { date: "desc" },
        include: {
          farm: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
      }),
      prisma.expense.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des dépenses récupérée", 200, {
      expenses,
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
export const getExpenseById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        farm: true,
        supplier: true,
        createdBy: true,
      },
    });

    if (!expense) {
      return ResponseApi.error(res, "Dépense non trouvée", 404);
    }

    return ResponseApi.success(res, "Dépense récupérée", 200, expense);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateExpense = async (
  req: Request<{ id: string }, {}, Partial<Expense>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.expense.update({
      where: { id: Number(req.params.id) },
      data: req.body,
      include: {
        farm: true,
        supplier: true,
        createdBy: true,
      },
    });

    return ResponseApi.success(res, "Dépense mise à jour avec succès", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Dépense non trouvée", 404);
    }
    next(error);
  }
};

// DELETE
export const deleteExpense = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.expense.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(res, "Dépense supprimée avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Dépense non trouvée", 404);
    }
    next(error);
  }
};
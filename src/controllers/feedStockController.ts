import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import {
  CreateFeedStockInput,
  UpdateFeedStockInput,
} from "../typages/feedStock.js";
import { PaymentMethod } from "../typages/payment.js";
export const createFeedStock = async (
  req: Request<{}, {}, CreateFeedStockInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      feedUsages,
      paymentMethod,
      paymentReference,
      paymentNotes,
      ...feedStockBody
    } = req.body as any;

    const quantity = Number(feedStockBody.quantity);
    const unitPrice =
      feedStockBody.unitPrice != null
        ? Number(feedStockBody.unitPrice)
        : undefined;
    const totalValue =
      feedStockBody.totalValue != null
        ? Number(feedStockBody.totalValue)
        : unitPrice != null
          ? quantity * unitPrice
          : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const stock = await tx.feedStock.create({
        data: {
          ...feedStockBody,
          quantity,
          ...(unitPrice != null && { unitPrice }),
          ...(totalValue != null && { totalValue }),
          ...(feedUsages ? { feedUsages: { create: feedUsages } } : {}),
        } as any,
        include: {
          farm: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });

      let payment = null;
      if (unitPrice != null && totalValue != null && totalValue > 0) {
        payment = await tx.payment.create({
          data: {
            farmId: stock.farmId,
            feedStockId: stock.id,
            amount: totalValue,
            method: (paymentMethod as PaymentMethod) || PaymentMethod.cash,
            status: "COMPLETED",
            reference: paymentReference || null,
            notes: paymentNotes || `Achat stock : ${stock.name}`,
            paidAt: new Date(),
            recordedById: (req as any).user?.id ?? null,
          } as any,
        });

        await tx.expense.create({
          data: {
            notes: paymentNotes || `Achat stock : ${stock.name}`,
            date: new Date(),
            amount: totalValue,
            totalAmount: totalValue,
            farmId: stock.farmId,
            category: "FEED",
            supplierId: stock.supplierId,
            paymentMethod: paymentMethod || "cash",
            createdById: (req as any).user?.id ?? null,
          } as any,
        });
      }

      return { ...stock, payments: payment ? [payment] : [] };
    });

    return ResponseApi.success(
      res,
      "Stock d'aliment créé avec succès",
      201,
      result,
    );
  } catch (error: any) {
    next(error);
  }
};

export const getAllFeedStocks = async (
  req: Request<
    {},
    {},
    {},
    { farmId?: string; page?: string; limit?: string; status?: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, page, limit, status } = req.query;
    const currentPage = Number(page) || 1;
    const take = Number(limit) || 15;
    const skip = (currentPage - 1) * take;

    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;

    const [stocks, totalItems] = await Promise.all([
      prisma.feedStock.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          farm: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      }),
      prisma.feedStock.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des stocks récupérée", 200, {
      stocks,
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

export const getFeedStockById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stock = await prisma.feedStock.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        farm: true,
        supplier: true,
        feedUsages: true,
        animalFeedings: true,
        feedingPlans: true,
      },
    });

    if (!stock) return ResponseApi.error(res, "Stock non trouvé", 404);

    return ResponseApi.success(res, "Stock récupéré", 200, stock);
  } catch (error) {
    next(error);
  }
};

export const updateFeedStock = async (
  req: Request<{ id: string }, {}, UpdateFeedStockInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);
    const { paymentMethod, paymentReference, paymentNotes, ...updateBody } =
      req.body as any;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.feedStock.findUnique({ where: { id } });
      if (!existing) throw new Error("NOT_FOUND");

      const quantity =
        updateBody.quantity !== undefined
          ? Number(updateBody.quantity)
          : Number(existing.quantity);
      const unitPrice =
        updateBody.unitPrice !== undefined
          ? Number(updateBody.unitPrice)
          : existing.unitPrice != null
            ? Number(existing.unitPrice)
            : undefined;
      const totalValue =
        updateBody.totalValue !== undefined
          ? Number(updateBody.totalValue)
          : unitPrice != null
            ? quantity * unitPrice
            : undefined;

      const updated = await tx.feedStock.update({
        where: { id },
        data: {
          ...updateBody,
          ...(unitPrice != null && { unitPrice }),
          ...(totalValue != null && { totalValue }),
        } as any,
        include: { farm: true, supplier: true },
      });

      let payment = null;
      if (unitPrice != null && totalValue != null && totalValue > 0) {
        const existingPayment = await tx.payment.findFirst({
          where: { feedStockId: id } as any,
        });

        if (existingPayment) {
          payment = await tx.payment.update({
            where: { id: existingPayment.id },
            data: {
              amount: totalValue,
              ...(paymentMethod && { method: paymentMethod }),
              ...(paymentReference !== undefined && {
                reference: paymentReference || null,
              }),
              ...(paymentNotes !== undefined && {
                notes: paymentNotes || null,
              }),
            } as any,
          });
        } else {
          payment = await tx.payment.create({
            data: {
              farmId: updated.farmId,
              feedStockId: id,
              amount: totalValue,
              totalAmount:totalValue,
              method: PaymentMethod.cash,
              status: "COMPLETED",
              reference: paymentReference || null,
              notes: paymentNotes || `Réapprovisionnement : ${updated.name}`,
              paidAt: new Date(),
              createdById: (req as any).user?.id ?? null,
            } as any,
          });
        }
      }

      return { ...updated, payments: payment ? [payment] : [] };
    });

    return ResponseApi.success(
      res,
      "Stock mis à jour avec succès",
      200,
      result,
    );
  } catch (error: any) {
    if (error.message === "NOT_FOUND" || error.code === "P2025") {
      return ResponseApi.error(res, "Stock non trouvé", 404);
    }

    next(error);
  }
};

export const deleteFeedStock = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deleted = await prisma.feedStock.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Stock supprimé avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Stock non trouvé", 404);
    }
    next(error);
  }
};

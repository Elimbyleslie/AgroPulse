import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Sale, SaleItem, SaleStatus, PaymentMethod,  } from "../typages/expenseSale.js";
import {PaymentStatus } from "../typages/payment.js";

// ========================
// CREATE SALE
// ========================
export const createSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { farmId, clientId, total, notes, paymentMethod = "cash", status = SaleStatus.COMPLETED } = req.body;
    const user = req.user;

    const sale = await prisma.sale.create({
      data: {
        date: new Date(),
        farm: { connect: { id: Number(farmId) } },
        client: { connect: { id: Number(clientId) } },
        total,
        notes,
        status,
        paymentMethod,
      },
      include: { client: true },
    });

    // Création automatique du Payment
    if (status === SaleStatus.COMPLETED && total > 0) {
      await prisma.payment.create({
        data: {
          saleId: sale.id,
          farmId,
          organizationId: user?.defaultOrganizationId,
          amount: total,
          method: paymentMethod,
          status: PaymentStatus.SUCCESS,
          reference: `SALE-${sale.id}`,
          userId: user?.id,
        },
      });
    }

    return ResponseApi.success(res, "Vente + paiement enregistrés", 201, sale);
  } catch (error) {
    next(error);
  }
};

// ========================
// GET ALL SALES
// ========================
export const getAllSales = async (
  req: Request<{}, {}, {}, { 
    farmId?: string; 
    page?: string; 
    limit?: string; 
    status?: SaleStatus; 
    startDate?: string; 
    endDate?: string 
  }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, page = "1", limit = "15", status, startDate, endDate } = req.query;

    const currentPage = Number(page);
    const pageSize = Number(limit);
    const skip = (currentPage - 1) * pageSize;

    const where: any = {};

    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [sales, totalItems] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
        include: {
          saleItems: true,
          client: { select: { id: true, name: true, phone: true } },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des ventes récupérée", 200, {
      sales,
      pagination: {
        currentPage,
        previousPage: currentPage > 1 ? currentPage - 1 : null,
        nextPage: currentPage * pageSize < totalItems ? currentPage + 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// GET SALE BY ID
// ========================
export const getSaleById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        saleItems: true,
        client: true,
        farm: true,
      },
    });

    if (!sale) {
      return ResponseApi.error(res, "Vente non trouvée", 404);
    }

    return ResponseApi.success(res, "Détails de la vente récupérés", 200, sale);
  } catch (error) {
    next(error);
  }
};

// ========================
// UPDATE SALE
// ========================
export const updateSale = async (
  req: Request<{ id: string }, {}, Partial<Sale>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { date, saleItems, ...saleData } = req.body;
    const updateData: any = {};

    if (date !== undefined) updateData.date = new Date(date);
    if (saleData.farmId !== undefined) updateData.farmId = saleData.farmId;
    if (saleData.total !== undefined) updateData.total = saleData.total;
    if (saleData.clientId !== undefined) updateData.clientId = saleData.clientId;
    if (saleData.notes !== undefined) updateData.notes = saleData.notes;
    if (saleData.status !== undefined) updateData.status = saleData.status;
    if (saleData.paymentMethod !== undefined) updateData.paymentMethod = saleData.paymentMethod;

    const updatedSale = await prisma.sale.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        saleItems: true,
        client: true,
        farm: true,
      },
    });

    return ResponseApi.success(res, "Vente mise à jour avec succès", 200, updatedSale);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Vente non trouvée", 404);
    }
    next(error);
  }
};

// ========================
// DELETE SALE
// ========================
export const deleteSale = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const deleted = await prisma.sale.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(res, "Vente supprimée avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Vente non trouvée", 404);
    }
    next(error);
  }
};
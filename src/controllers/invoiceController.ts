// src/controllers/invoiceController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { PaymentMethod } from "@/typages/expenseSale.js";

async function generateInvoiceNumber(tx: any): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.invoice.count({
    where: {
      number: { startsWith: `INV-${year}-` },
    },
  });
  return `INV-${year}-${String(count + 1).padStart(6, "0")}`;
}

// ======================================================
// CREATE Invoice
// ======================================================
export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      organizationId,
      subscriptionId,
      amount,
      taxAmount = 0,
      currency = "XOF",
      status = "OPEN",
      periodStart,
      periodEnd,
      dueDate,
      notes,
      method,
    } = req.body;

    if (!organizationId || amount === undefined) {
      return ResponseApi.error(
        res,
        "organizationId et amount sont obligatoires",
        400,
      );
    }

    const totalAmount = Number(amount) + Number(taxAmount || 0);

    const invoice = await prisma.$transaction(async (tx) => {
      const number = await generateInvoiceNumber(tx);

      return tx.invoice.create({
        data: {
          organizationId: Number(organizationId),
          subscriptionId: subscriptionId ? Number(subscriptionId) : null,
          number,
          status,
          amount: Number(amount),
          taxAmount: Number(taxAmount || 0),
          totalAmount,
          currency,
          periodStart: periodStart ? new Date(periodStart) : null,
          periodEnd: periodEnd ? new Date(periodEnd) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          issuedAt: new Date(),
          notes: notes || null,
          method, 
        },
        include: {
          subscription: { include: { plan: true } },
          organization: { select: { id: true, name: true } },
        },
      });
    });

    return ResponseApi.success(res, "Facture créée", 201, invoice);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET Invoice by ID
// ======================================================
export const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: Number(id) },
      include: {
        subscription: { include: { plan: true } },
        organization: { select: { id: true, name: true } },
        payments: true,
      },
    });

    if (!invoice) {
      return ResponseApi.error(res, "Facture non trouvée", 404);
    }

    return ResponseApi.success(res, "Facture trouvée", 200, invoice);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET Organization Invoices
// ======================================================
export const getAllOrganizationInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId =
      req.params.organizationId ||
      req.query.organizationId ||
      (req as any).user?.defaultOrganizationId ||
      (req as any).user?.organizationId;

    if (!organizationId) {
      return ResponseApi.error(res, "organizationId requis", 400);
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const where: any = {
      organizationId: Number(organizationId),
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { number: { contains: String(search), mode: "insensitive" } },
        { notes: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const [invoices, totalItems] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          subscription: { include: { plan: true } },
          payments: true,
        },
        orderBy: { issuedAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des factures", 200, {
      invoices,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE Invoice status
// ======================================================
export const updateInvoiceStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }
    if (!status) {
      return ResponseApi.error(res, "Statut requis", 400);
    }

    const data: any = { status };
    if (status === "PAID") {
      data.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data,
      include: {
        subscription: { include: { plan: true } },
        payments: true,
      },
    });

    return ResponseApi.success(res, "Statut mis à jour", 200, invoice);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Facture non trouvée", 404);
    }
    next(error);
  }
};

// ======================================================
// DELETE Invoice
// ======================================================
export const deleteInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const deleted = await prisma.invoice.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Facture supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Facture non trouvée", 404);
    }
    next(error);
  }
};
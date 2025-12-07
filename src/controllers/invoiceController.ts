// src/controllers/invoiceController.ts
import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// Générer une facture
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const {
      organizationId,
      subscriptionId,
      amount,
      status,
      currency,
      paymentMethod,
      dueAt,
    } = req.body;

    if (!organizationId || !subscriptionId || !amount || !currency) {
      return ResponseApi.error(res, "Champs requis manquants", 400);
    }

    const invoice = await prisma.invoice.create({
      data: {
        organizationId,
        subscriptionId,
        amount,
        status: status || "pending",
        currency,
        paymentMethod,
        dueAt,
      },
      include: { subscription: true },
    });

    return ResponseApi.success(res, "Facture créée", 201, invoice);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Lister toutes les factures d'une organisation
export const getAllOrganizationInvoices = async (
  req: Request,
  res: Response
) => {
  try {
    const { organizationId } = req.params;

    const invoices = await prisma.invoice.findMany({
      where: { organizationId: Number(organizationId) },
      include: { subscription: true },
      orderBy: { issuedAt: "desc" },
    });

    return ResponseApi.success(res, "Liste des factures", 200, invoices);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};
// Mettre à jour le statut d'une facture
export const updateInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return ResponseApi.error(res, "Statut requis", 400);
    }
    const invoice = await prisma.invoice.update({
      where: { id: Number(id) },
      data: { status },
    });
    return ResponseApi.success(res, "Statut mis à jour", 200, invoice);
  } catch (error) {
    console.error(error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// Supprimer une facture
export const deleteInvoice = async (req: Request, res: Response) =>
  ResponseApi.success(
    res,
    "Facture supprimée",
    200,
    await prisma.invoice.delete({
      where: { id: Number(req.params.id) },
      include: { subscription: true },
    })
  );

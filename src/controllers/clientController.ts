import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Client } from "../typages/client.js";

// CREATE
export const createClient = async (
  req: Request<{}, {}, Client>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, farmId, ...rest } = req.body;

    if (!name || !farmId) {
      return ResponseApi.error(res, "Le nom et l'identifiant de la ferme sont obligatoires", 400);
    }

    const existing = await prisma.client.findFirst({
      where: {
        farmId: Number(farmId),
        email: email?.toLowerCase().trim(),
      },
    });

    if (existing) {
      return ResponseApi.error(res, "Un client avec cet email existe déjà pour cette ferme", 409);
    }

    const client = await prisma.client.create({
      data: {
        ...rest,
        name: name.trim(),
        email: email ? email.toLowerCase().trim() : null,
        phone: phone?.trim() || null,
        farmId: Number(farmId),
      },
      include: {
        sales: {
          take: 5,
          orderBy: { date: "desc" },
          select: { id: true, total: true, date: true, status: true, paymentMethod: true },
        },
      },
    });

    return ResponseApi.success(res, "Client créé avec succès", 201, client);
  } catch (error: any) {
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Un client avec cet email existe déjà", 409);
    }
    next(error);
  }
};

export const getAllClients = async (
  req: Request<{}, {}, {}, { 
    farmId?: string; 
    search?: string; 
    page?: string; 
    limit?: string;
    status?: string;
  }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, search, page, limit, status } = req.query;

    if (!farmId) {
      return ResponseApi.error(res, "farmId est obligatoire", 400);
    }

    const currentPage = Number(page) || 1;
    const take = Math.min(Number(limit) || 15, 100);
    const skip = (currentPage - 1) * take;

    const where: any = { farmId: Number(farmId) };

    if (search) {
      const s = search.trim();
      where.OR = [
        { name: { contains: s, mode: "insensitive" } },
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.sales = {
        some: { status }
      };
    }

    const [clients, totalItems] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          sales: {
            take: 3,
            orderBy: { date: "desc" },
            select: { 
              id: true, 
              total: true, 
              date: true, 
              status: true,
              paymentMethod: true 
            },
          },
          _count: {
            select: { sales: true }
          }
        },
      }),
      prisma.client.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des clients récupérée avec succès", 200, {
      clients,
      pagination: {
        currentPage,
        totalPages: Math.ceil(totalItems / take),
        totalItems,
        hasNext: currentPage * take < totalItems,
        hasPrev: currentPage > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getClientById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        sales: {
          orderBy: { date: "desc" },
          include: {
            saleItems: {
              include: { lot: true, animal: true }
            }
          },
        },
        farm: { select: { id: true, name: true } },
      },
    });

    if (!client) {
      return ResponseApi.error(res, "Client non trouvé", 404);
    }

    return ResponseApi.success(res, "Client récupéré avec succès", 200, client);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateClient = async (
  req: Request<{ id: string }, {}, Partial<Client>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone, ...rest } = req.body;

    const client = await prisma.client.update({
      where: { id: Number(req.params.id) },
      data: {
        ...rest,
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
        ...(phone && { phone: phone.trim() }),
      },
      include: {
        sales: {
          take: 5,
          orderBy: { date: "desc" },
          select: { id: true, total: true, date: true, status: true },
        },
      },
    });

    return ResponseApi.success(res, "Client mis à jour avec succès", 200, client);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Client non trouvé", 404);
    }
    if (error.code === "P2002") {
      return ResponseApi.error(res, "Un client avec cet email existe déjà", 409);
    }
    next(error);
  }
};

// DELETE
export const deleteClient = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientWithSales = await prisma.client.findUnique({
      where: { id: Number(req.params.id) },
      select: { _count: { select: { sales: true } } }
    });

    if (clientWithSales?._count.sales && clientWithSales._count.sales > 0) {
      return ResponseApi.error(res, "Impossible de supprimer un client ayant des ventes enregistrées", 409);
    }

    const deleted = await prisma.client.delete({
      where: { id: Number(req.params.id) },
    });

    return ResponseApi.success(res, "Client supprimé avec succès", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Client non trouvé", 404);
    }
    next(error);
  }
};
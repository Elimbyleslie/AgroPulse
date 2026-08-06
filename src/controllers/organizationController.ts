import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Organization } from "../typages/organization.js";
import { createOrgAndAssignRole } from "./AssignRole.js";
// ➕ Créer une organisation
export const createOrganization = async (
  req: Request<any, any, Organization>,
  res: Response,
) => {
  try {
    const { name, address, ownerName, email, phone } = req.body;

    // 1. Validations de base
    if (!name || !ownerName) {
      return ResponseApi.error(res, "Le nom et l'ownerName sont requis", 400);
    }

    if (!req.user?.id) {
      return ResponseApi.error(res, "Utilisateur non authentifié", 401);
    }

    // 2. Vérification d'existence
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name,
        ownerId: req.user.id,
      },
    });

    if (existingOrganization) {
      return ResponseApi.error(
        res,
        "Vous avez déjà une organisation avec ce nom",
        400,
      );
    }

    // 3. APPEL UNIQUE AU SERVICE (Il crée l'org ET assigne le rôle en un seul bloc)
    const organization = await createOrgAndAssignRole(req.user.id, {
      name,
      address,
      ownerName,
      email,
      phone,
    });

    // Ne mettre à jour que si pas encore de ferme par défaut
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: { defaultOrganizationId: true },
    });

    if (!currentUser?.defaultOrganizationId) {
      await prisma.user.update({
        where: { id: req.user?.id },
        data: {
          defaultOrganizationId: organization.id,
        },
      });
    }

    return ResponseApi.success(
      res,
      "Organisation créée avec succès et rôle assigné",
      201,
      organization,
    );
  } catch (error) {
    console.error("Erreur création organisation:", error);
    return ResponseApi.error(res, "Erreur serveur lors de la création", 500);
  }
};

// 📋 Lister UNIQUEMENT les organisations de l'utilisateur connecté
export const getAllMyOrganizations = async (req: Request, res: Response) => {
  try {
    // ✅ Vérifier que l'utilisateur est authentifié
    if (!req.user?.id) {
      return ResponseApi.error(res, "Utilisateur non authentifié", 401);
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // ✅ Filtrer par ownerId = utilisateur connecté
    const where = {
      ownerId: req.user.id, // ← FILTRE PRINCIPAL
    };

    // Récupération avec relations
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where, // ✅ Appliquer le filtre
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          farms: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
          subscriptions: true,
          invoices: true,
          apiKeys: true,
          backups: true,
          audit: true,
          payments: true,
        },
      }),

      prisma.organization.count({ where }), // ✅ Compter uniquement les organisations de l'utilisateur
    ]);

    return ResponseApi.success(
      res,
      "Liste des organisations récupérée avec succès",
      200,
      {
        data: organizations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error) {
    console.error("Erreur récupération organisations:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// 📌 Récupérer une organisation par ID (UNIQUEMENT si elle appartient à l'utilisateur)
export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ✅ Vérifier que l'utilisateur est authentifié
    if (!req.user?.id) {
      return ResponseApi.error(res, "Utilisateur non authentifié", 401);
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id: Number(id),
        ownerId: req.user.id, // ✅ Vérifier que c'est bien son organisation
      },
      include: {
        users: true,
        subscriptions: true,
        invoices: true,
        farms: true,
      },
    });

    if (!organization) {
      return ResponseApi.error(
        res,
        "Organisation non trouvée ou vous n'avez pas accès",
        404,
      );
    }

    return ResponseApi.success(res, "Organisation trouvée", 200, organization);
  } catch (error) {
    console.error("Erreur récupération organisation:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// ✏️ Mettre à jour une organisation (UNIQUEMENT si elle appartient à l'utilisateur)
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // ✅ Validation de l'ID
    if (!id) {
      return ResponseApi.error(res, "ID de l'organisation manquant", 400);
    }

    // ✅ Vérifier que l'utilisateur est authentifié
    if (!req.user?.id) {
      return ResponseApi.error(res, "Utilisateur non authentifié", 401);
    }

    const organizationId = Number(id);
    if (isNaN(organizationId)) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    // ✅ Vérifier que l'organisation appartient à l'utilisateur AVANT de modifier
    const existingOrg = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        ownerId: req.user.id,
      },
    });

    if (!existingOrg) {
      return ResponseApi.error(
        res,
        "Organisation non trouvée ou vous n'avez pas le droit de la modifier",
        403,
      );
    }

    // Mettre à jour l'organisation
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data,
    });

    return ResponseApi.success(
      res,
      "Organisation mise à jour",
      200,
      organization,
    );
  } catch (error: any) {
    console.error("Erreur mise à jour organisation:", error);

    if (error.code === "P2025") {
      return ResponseApi.error(res, "Organisation non trouvée", 404);
    }

    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// ❌ Supprimer une organisation (UNIQUEMENT si elle appartient à l'utilisateur)
export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ✅ Vérifier que l'utilisateur est authentifié
    if (!req.user?.id) {
      return ResponseApi.error(res, "Utilisateur non authentifié", 401);
    }

    // ✅ Vérifier que l'organisation appartient à l'utilisateur
    const existingOrg = await prisma.organization.findFirst({
      where: {
        id: Number(id),
        ownerId: req.user.id,
      },
    });

    if (!existingOrg) {
      return ResponseApi.error(
        res,
        "Organisation non trouvée ou vous n'avez pas le droit de la supprimer",
        403,
      );
    }

    const result = await prisma.organization.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Organisation supprimée", 200, result);
  } catch (error) {
    console.error("Erreur suppression organisation:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

export const getAllOrganizationsForSuperAdmin = async (
  req: Request,
  res: Response,
) => {
  try {
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Récupération avec relations
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          farms: true,
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              roles: {
                select: {
                  role: true,
                },
              },
            },
          },
          subscriptions: true,
          invoices: true,
          apiKeys: true,
          backups: true,
          audit: true,
          payments: true,
        },
      }),

      prisma.organization.count(),
    ]);

    return ResponseApi.success(
      res,
      "Liste des organisations récupérée avec succès",
      200,
      {
        data: organizations,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    );
  } catch (error) {
    console.error("Erreur récupération organisations:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

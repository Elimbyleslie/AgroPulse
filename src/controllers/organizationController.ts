import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Organization } from "../typages/organization.js";
// ➕ Créer une organisation
export const createOrganization = async (
  req: Request<any, any, Organization>,
  res: Response
) => {
  try {
    const { name, address, ownerName, contactEmail, contactPhone } = req.body;

    if (!name || !ownerName) {
      return ResponseApi.error(res, "Le nom et l'ownerId sont requis", 400);
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        address,
        ownerName,
        contactEmail,
        contactPhone,
      },
    });

    return ResponseApi.success(
      res,
      "Organisation créée avec succès",
      201,
      organization
    );
  } catch (error) {
    console.error("Erreur création organisation:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// 📋 Lister toutes les organisations
export const getOrganizations = async (req: Request, res: Response) => {
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
      }
    );
  } catch (error) {
    console.error("Erreur récupération organisations:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};


// 📌 Récupérer une organisation par ID
export const getOrganizationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await prisma.organization.findUnique({
      where: { id: Number(id) },
      include: {
        users: true,
        subscriptions: true,
        invoices: true,
      },
    });

    if (!organization)
      return ResponseApi.error(res, "Organisation non trouvée", 404);

    return ResponseApi.success(res, "Organisation trouvée", 200, organization);
  } catch (error) {
    console.error("Erreur récupération organisation:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

// ✏️ Mettre à jour une organisation
// export const updateOrganization = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     const organization = await prisma.organization.update({
//       where: { id: Number(id) },
//       data,
//     });

//     return ResponseApi.success(res, 'Organisation mise à jour', 200, organization);
//   } catch (error) {
//     console.error('Erreur mise à jour organisation:', error);
//     return ResponseApi.error(res, 'Erreur serveur', 500);
//   }
// };
// ✏️ Mettre à jour une organisation
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // ✅ Validation de l'ID
    if (!id) {
      return ResponseApi.error(res, "ID de l'organisation manquant", 400);
    }

    const organizationId = Number(id);
    if (isNaN(organizationId)) {
      return ResponseApi.error(res, "ID invalide", 400);
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
      organization
    );
  } catch (error: any) {
    console.error("Erreur mise à jour organisation:", error);

    // Gestion spécifique des erreurs Prisma
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Organisation non trouvée", 404);
    }

    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};
// ❌ Supprimer une organisation
export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await prisma.organization.delete({
      where: { id: Number(id) },
    });

    return ResponseApi.success(res, "Organisation supprimée", 200, result );
  } catch (error) {
    console.error("Erreur suppression organisation:", error);
    return ResponseApi.error(res, "Erreur serveur", 500);
  }
};

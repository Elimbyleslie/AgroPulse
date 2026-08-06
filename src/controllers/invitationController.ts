import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import Utilities from "../helpers/utilities.js";

export const createInvitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizationId = Number(req.params.organizationId);
    const { farmId, roleId, expiresAt, maxUses } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      return res.status(404).json(Utilities.errorResponse(404, "Organisation introuvable."));
    }

    // Seul le owner peut générer un lien
    if (organization.ownerId !== req.user?.id) {
      return res.status(403).json(Utilities.errorResponse(403, "Action réservée au propriétaire."));
    }
    console.log(organization.ownerId ,req.user.id)
    if (farmId) {
      const farm = await prisma.farm.findUnique({ where: { id: Number(farmId) } });
      if (!farm || farm.organizationId !== organizationId) {
        return res.status(400).json(Utilities.errorResponse(400, "Ferme invalide pour cette organisation."));
      }
    }

    const invitation = await prisma.invitation.create({
      data: {
        organizationId,
        farmId: farmId ? Number(farmId) : undefined,
        roleId: roleId ? Number(roleId) : undefined,
        createdBy: req.user!.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        maxUses: maxUses === null ? null : (maxUses ? Number(maxUses) : 1),
      },
    });

    return res.status(201).json(
      Utilities.successReponse(201, "Lien d'invitation généré.", invitation),
    );
  } catch (error) {
    next(error);
  }
};

// 🔍 Valider un token (appelé par la page d'inscription, avant création du compte)
export const getInvitationByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: { select: { id: true, name: true } },
        farm: { select: { id: true, name: true } },
      },
    });

    if (!invitation) {
      return res.status(404).json(Utilities.errorResponse(404, "Lien d'invitation invalide."));
    }
    if (invitation.expiresAt && invitation.expiresAt < new Date()) {
      return res.status(410).json(Utilities.errorResponse(410, "Ce lien d'invitation a expiré."));
    }
    if (invitation.maxUses !== null && invitation.usedCount >= invitation.maxUses) {
      return res.status(410).json(Utilities.errorResponse(410, "Ce lien d'invitation a déjà été utilisé."));
    }

    return res.status(200).json(
      Utilities.successReponse(200, "Invitation valide.", {
        organizationName: invitation.organization.name,
        farmName: invitation.farm?.name ?? null,
        token: invitation.token,
      }),
    );
  } catch (error) {
    return res.status(500).json(Utilities.errorResponse(500, "Erreur serveur."));
  }
};

// 📋 Lister les invitations d'une organisation (optionnel, pour gestion)
export const getOrganizationInvitations = async (req: Request, res: Response) => {
  try {
    const organizationId = Number(req.params.organizationId);
    const invitations = await prisma.invitation.findMany({
      where: { organizationId },
      include: { farm: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(Utilities.successReponse(200, "Invitations", invitations));
  } catch (error) {
    return res.status(500).json(Utilities.errorResponse(500, "Erreur serveur."));
  }
};

// 🗑️ Révoquer une invitation
export const deleteInvitation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const invitation = await prisma.invitation.findUnique({ where: { id } });
    if (!invitation) {
      return res.status(404).json(Utilities.errorResponse(404, "Invitation introuvable."));
    }
    if (invitation.createdBy !== req.user?.id) {
      return res.status(403).json(Utilities.errorResponse(403, "Action non autorisée."));
    }
    await prisma.invitation.delete({ where: { id } });
    return res.status(200).json(Utilities.successReponse(200, "Invitation révoquée.", {}));
  } catch (error) {
    return res.status(500).json(Utilities.errorResponse(500, "Erreur serveur."));
  }
};
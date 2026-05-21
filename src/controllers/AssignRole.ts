import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";

// ----------------- ROLE CRUD -----------------

// Créer un rôle
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const role = await prisma.role.create({
      data: { name, description },
    });
    res.status(201).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Lister tous les rôles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
    });
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un rôle par ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: Number(id) },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) return res.status(404).json({ message: "Rôle introuvable" });
    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour un rôle
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const role = await prisma.role.update({
      where: { id: Number(id) },
      data: { name, description },
    });
    res.json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un rôle
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { id: Number(id) } });
    res.json({ message: "Rôle supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ----------------- ASSIGNER PERMISSIONS -----------------

export const assignPermissionsToRole = async (req: Request, res: Response) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body; // tableau d'IDs de permission

    // Supprimer les permissions existantes
    await prisma.rolePermission.deleteMany({
      where: { roleId: Number(roleId) },
    });

    // Ajouter les nouvelles permissions
    const rolePermissions = await prisma.rolePermission.createMany({
      data: permissionIds.map((pid: number) => ({
        roleId: Number(roleId),
        permissionId: pid,
      })),
    });

    res.json({ message: "Permissions mises à jour", rolePermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


/**
 * Assign the SUPER_ADMIN role to a user if eligible.
 *
 * Eligibility is determined by the following rules:
 * 1. The user must be one of the first 5 users created.
 * 2. The user must not already have the SUPER_ADMIN role.
 *
 * @param {number} userId - The ID of the user to assign the SUPER_ADMIN role to.
 */
export async function assignSuperAdminIfEligible(userId: number) {
  // 1. Count the number of users in the database
  const userCount = await prisma.user.count();

  // 2. Verify the limit of 5 users
  if (userCount > 5) {
    console.log(
      "More than 5 users in the database, no additional SuperAdmins can be assigned.",
    );
    return;
  }

  // 3. Retrieve the SUPER_ADMIN role
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  if (!superAdminRole) throw new Error("The SUPER_ADMIN role does not exist.");

  // 4. Verify if the user already has the SUPER_ADMIN role
  const existingAssignment = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId: superAdminRole.id } },
  });

  if (existingAssignment) {
    console.log("The user is already a SuperAdmin.");
    return;
  }

  // 5. Assign the SUPER_ADMIN role
  await prisma.userRole.create({
    data: {
      userId,
      roleId: superAdminRole.id,
      assignedBy: "SYSTEM",
      assignedAt: new Date(),
    },
  });

  console.log(`User ${userId} assigned to the SUPER_ADMIN role!`);
}


export const removeRoleFromUser = async (userId: number, roleId: number) => {
  try {
    await prisma.userRole.deleteMany({
      where: {
        userId,
        roleId,
      },
    });
    console.log(`Rôle ${roleId} retiré de l'utilisateur ${userId}`);
  } catch (error) {
    console.error("Erreur lors du retrait du rôle:", error);
  }
};

// services/organization.service.ts

export const createOrgAndAssignRole = async (userId: number, orgData: any) => {
  return await prisma.$transaction(async (tx) => {

    const org = await tx.organization.create({
      data: {
        ...orgData,
        ownerId: userId,
      },
    });

    const role = await tx.role.findUnique({
      where: { name: "ORGANIZATION_OWNER" },
    });

    if (!role) {
    
      console.warn(
        "[createOrgAndAssignRole] Rôle ORGANIZATION_OWNER introuvable en DB — assignation ignorée"
      );
      return org;
    }

    // 3. Assigner le rôle (upsert = idempotent, pas de doublon)
    await tx.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id },
      },
      update: {}, // Déjà assigné → on ne touche rien
      create: {
        userId,
        roleId: role.id,
        assignedBy: "AUTO_ORG_CREATE",
      },
    });

    return org;
  });
};
export const VerifyOrgOwnerRole = async (organizationId: number, userId: number) => {
  try {
    // 1️⃣ VÉRIFICATION : L'utilisateur est-il vraiment le propriétaire en BD ?
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true }
    });

    if (!organization) {
      console.error("❌ Organisation introuvable.");
      return;
    }

    if (organization.ownerId !== userId) {
      console.error("❌ Sécurité : Cet utilisateur n'est pas le créateur de cette organisation.");
      return;
    }

    // 2️⃣ LIAISON : Ajouter l'utilisateur comme membre (relation OrganizationMembers)
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        users: { connect: { id: userId } }
      }
    });

    // 3️⃣ RÔLE : Récupérer et assigner ORGANIZATION_OWNER
    const role = await prisma.role.findUnique({
      where: { name: "ORGANIZATION_OWNER" }
    });

    if (!role) throw new Error("Rôle ORGANIZATION_OWNER introuvable en base de données.");

    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId: role.id }
      },
      update: {}, 
      create: {
        userId,
        roleId: role.id,
        assignedBy: "SYSTEM_AUTO_ASSIGN"
      }
    });

    console.log(`✅ Rôle ORGANIZATION_OWNER confirmé pour l'utilisateur ${userId}`);
  } catch (error) {
    console.error("❌ Erreur dans assignOrgOwnerRole:", error);
  }
};

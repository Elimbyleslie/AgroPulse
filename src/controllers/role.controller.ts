import { Request, Response } from "express";
import  prisma from "../models/prismaClient.js";

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
    await prisma.rolePermission.deleteMany({ where: { roleId: Number(roleId) } });

    // Ajouter les nouvelles permissions
    const rolePermissions = await prisma.rolePermission.createMany({
      data: permissionIds.map((pid: number) => ({ roleId: Number(roleId), permissionId: pid })),
    });

    res.json({ message: "Permissions mises à jour", rolePermissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/*

 * Assigne automatiquement le rôle SUPER_ADMIN à un utilisateur si 
 * le nombre total d'utilisateurs dans la base est inférieur ou égal à 5.
 */
export async function assignSuperAdminIfEligible(userId: number) {
  // 1️⃣ Compter le nombre d'utilisateurs existants
  const userCount = await prisma.user.count();

  // 2️⃣ Vérifier la limite de 5 utilisateurs
  if (userCount > 5) {
    console.log("Plus de 5 utilisateurs en base, aucun SuperAdmin supplémentaire.");
    return;
  }

  // 3️⃣ Récupérer le rôle SUPER_ADMIN
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });
  if (!superAdminRole) throw new Error("Le rôle SUPER_ADMIN n'existe pas.");

  // 4️⃣ Vérifier si l'utilisateur a déjà ce rôle
  const existingAssignment = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId, roleId: superAdminRole.id } },
  });

  if (existingAssignment) {
    console.log("L'utilisateur est déjà SuperAdmin.");
    return;
  }

  // 5️⃣ Assigner le rôle SUPER_ADMIN
  await prisma.userRole.create({
    data: {
      userId,
      roleId: superAdminRole.id,
      assignedBy: "SYSTEM",
      assignedAt: new Date(),
    },
  });

  console.log(`Utilisateur ${userId} assigné au rôle SUPER_ADMIN !`);
}

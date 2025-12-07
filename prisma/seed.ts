import prisma from "../src/models/prismaClient.js";
import { Permission } from "../src/typages/permissions.js"; // adapte le chemin !

// --- ROLES ---
const roles = [
  { name: "SUPER_ADMIN", description: "Accès total à l'application" },
  { name: "OWNER", description: "Propriétaire de l'organisation" },
  { name: "FARMER", description: "Gère les fermes et les animaux" },
  { name: "VETERINARY", description: "Gère la santé des animaux" },
  { name: "FINANCE", description: "Gère la finance et les ventes" },
  { name: "EQUIPMENT_MANAGER", description: "Gère le matériel et équipements" },
];

// --- PERMISSIONS ---
// Génération auto à partir de ton gros objet Permission
const permissions = Object.values(Permission).map(code => ({
  code,
  description: code.replace(/_/g, " ").toLowerCase(), // Description par défaut
}));

// --- ROLE → PERMISSIONS mapping ---
const rolePermissionsMap = {
  SUPER_ADMIN: permissions.map(p => p.code), // Toutes les permissions

  OWNER: [
    Permission.READ_ORGANIZATION,
    Permission.UPDATE_ORGANIZATION,

    Permission.READ_USER,
    Permission.CREATE_USER,

    Permission.READ_FARM,
    Permission.CREATE_FARM,
    Permission.UPDATE_FARM,

    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_SALE,
    Permission.READ_EXPENSE,
  ],

  FARMER: [
    Permission.READ_FARM,
    Permission.UPDATE_FARM,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,

    Permission.READ_HEALTH_RECORD,
    Permission.READ_FEED_USAGE,
  ],

  VETERINARY: [
    Permission.READ_ANIMAL,
    Permission.UPDATE_ANIMAL,

    Permission.READ_HEALTH_RECORD,
    Permission.CREATE_HEALTH_RECORD,
    Permission.UPDATE_HEALTH_RECORD,

    Permission.READ_TREATMENT,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,

    Permission.READ_VACCINATION,
    Permission.CREATE_VACCINATION,
    Permission.UPDATE_VACCINATION,
  ],

  FINANCE: [
    Permission.READ_SALE,
    Permission.CREATE_SALE,
    Permission.UPDATE_SALE,
    Permission.DELETE_SALE,

    Permission.READ_EXPENSE,
    Permission.CREATE_EXPENSE,
    Permission.UPDATE_EXPENSE,
    Permission.DELETE_EXPENSE,

    Permission.READ_FINANCIAL_REPORT,
  ],

  EQUIPMENT_MANAGER: [
    Permission.READ_EQUIPMENT,
    Permission.CREATE_EQUIPMENT,
    Permission.UPDATE_EQUIPMENT,
    Permission.DELETE_EQUIPMENT,

    Permission.READ_MAINTENANCE,
    Permission.CREATE_MAINTENANCE,
    Permission.UPDATE_MAINTENANCE,
    Permission.DELETE_MAINTENANCE,
  ],
};

async function main() {
  console.log("🌱 Seeding roles and permissions...");

  // --- Insert permissions ---
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
  }

  // --- Insert roles ---
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  // --- Assign permissions to roles ---
  for (const role of roles) {
    const dbRole = await prisma.role.findUnique({
      where: { name: role.name },
    });

    if (!dbRole) {
      console.warn(`Role not found in DB: ${role.name}`);
      continue;
    }

    const perms = rolePermissionsMap[role.name as keyof typeof rolePermissionsMap] || [];

    for (const code of perms) {
      const dbPerm = await prisma.permission.findUnique({ where: { code } });

      if (!dbPerm) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: dbRole.id,
            permissionId: dbPerm.id,
          },
        },
        update: {},
        create: {
          roleId: dbRole.id,
          permissionId: dbPerm.id,
        },
      });
    }
 }

  console.log("✅ Seeding terminé !");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

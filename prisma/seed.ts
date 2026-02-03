import prisma from "../src/models/prismaClient.js";
import { Permission } from "../src/helpers/permissions.js"; // adapte le chemin !

// --- ROLES ---
const roles = [
  { name: "SUPER_ADMIN", description: "Accès total à l'application" },
  { name: "ADMIN", description: "Accès partial à l'application" },
  { name: "ORGANIZATION_OWNER", description: "Propriétaire de l'organisation" },
  { name: "FARM_MANAGER", description: "Gère les fermes" },
  { name: "FARMER", description: "Gère les animaux" },
  { name: "VETERINARY", description: "Gère la santé des animaux" },
  { name: "FINANCE_MANAGER", description: "Gère la finance et les ventes" },
  { name: "EQUIPMENT_MANAGER", description: "Gère le matériel et équipements" },
  { name: "STOCK_MANAGER", description: "Gère le stock" },
  { name: "LOGS_MANAGER", description: "Gère les logs" },
];

// --- PERMISSIONS ---

const permissions = Object.values(Permission).map((code) => ({
  code,
  description: code.replace(/_/g, " ").toLowerCase(),
}));

// --- ROLE → PERMISSIONS mapping ---
const rolePermissionsMap = {
  SUPER_ADMIN: permissions.map((p) => p.code), // Toutes les permissions

  ADMIN: [
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

    Permission.READ_REPORT,

    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_INVOICE,

    Permission.READ_PRODUCTION,
    Permission.READ_FEEDSTOCK,
    Permission.READ_TREATMENT,
    Permission.READ_VACCINATION,
    Permission.READ_EQUIPMENT,
    Permission.READ_MAINTENANCE,

    Permission.READ_REPORT,
    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_INVOICE,
    Permission.READ_SALE,
    Permission.READ_EXPENSE,
    Permission.READ_MAINTENANCE,

    Permission.CREATE_REPORT,
    Permission.CREATE_FINANCIAL_REPORT,
    Permission.CREATE_INVOICE,
    Permission.CREATE_SALE,
    Permission.CREATE_EXPENSE,
    Permission.CREATE_MAINTENANCE,

    Permission.UPDATE_REPORT,
    Permission.UPDATE_FINANCIAL_REPORT,
    Permission.UPDATE_INVOICE,
    Permission.UPDATE_SALE,
    Permission.UPDATE_EXPENSE,
    Permission.UPDATE_MAINTENANCE,

    Permission.DELETE_REPORT,
    Permission.DELETE_FINANCIAL_REPORT,
    Permission.DELETE_INVOICE,
    Permission.DELETE_SALE,
    Permission.DELETE_EXPENSE,
    Permission.DELETE_MAINTENANCE,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,
    Permission.DELETE_ANIMAL,

    Permission.READ_LOT,
    Permission.CREATE_LOT,
    Permission.UPDATE_LOT,
    Permission.DELETE_LOT,

  ],  

  ORGANIZATION_OWNER: [
    Permission.READ_ORGANIZATION,
    Permission.UPDATE_ORGANIZATION,
    Permission.DELETE_ORGANIZATION,
    Permission.CREATE_ORGANIZATION,

    Permission.READ_SUBSCRIPTION,
    Permission.CREATE_SUBSCRIPTION,
    Permission.UPDATE_SUBSCRIPTION,
    Permission.DELETE_SUBSCRIPTION,

    Permission.READ_USER,
    Permission.CREATE_USER,

    Permission.READ_SPECIES,
    Permission.READ_BREED,
    Permission.READ_HERD,
    Permission.CREATE_HERD,
    Permission.DELETE_HERD,
    Permission.UPDATE_HERD,
    Permission.READ_BARN,
    Permission.CREATE_BARN,
    Permission.CREATE_ANIMAL_FEEDING,    

    Permission.READ_FARM,
    Permission.CREATE_FARM,
    Permission.UPDATE_FARM,
    Permission.DELETE_FARM,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.DELETE_ANIMAL,
    Permission.UPDATE_ANIMAL,


    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_SALE,
    Permission.READ_EXPENSE,

    Permission.READ_REPORT,

    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_INVOICE,

    Permission.READ_PRODUCTION,
    Permission.READ_FEEDSTOCK,
    Permission.READ_TREATMENT,
    Permission.READ_VACCINATION,
    Permission.READ_EQUIPMENT,
    Permission.READ_MAINTENANCE,

    Permission.READ_REPORT,
    Permission.READ_FINANCIAL_REPORT,
    Permission.READ_INVOICE,
    Permission.READ_SALE,
    Permission.READ_EXPENSE,
    Permission.READ_MAINTENANCE,

    Permission.CREATE_REPORT,
    Permission.CREATE_FINANCIAL_REPORT,
    Permission.CREATE_INVOICE,
    Permission.CREATE_SALE,
    Permission.CREATE_EXPENSE,
    Permission.CREATE_MAINTENANCE,

    Permission.UPDATE_REPORT,
    Permission.UPDATE_FINANCIAL_REPORT,
    Permission.UPDATE_INVOICE,
    Permission.UPDATE_SALE,
    Permission.UPDATE_EXPENSE,
    Permission.UPDATE_MAINTENANCE,

    Permission.DELETE_REPORT,
    Permission.DELETE_FINANCIAL_REPORT,
    Permission.DELETE_INVOICE,
    Permission.DELETE_SALE,
    Permission.DELETE_EXPENSE,
    Permission.DELETE_MAINTENANCE,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,
    Permission.DELETE_ANIMAL,

    Permission.READ_LOT,
    Permission.CREATE_LOT,
    Permission.UPDATE_LOT,
    Permission.DELETE_LOT,

    Permission.READ_PRODUCTION,
    Permission.CREATE_PRODUCTION,
    Permission.UPDATE_PRODUCTION,
    Permission.DELETE_PRODUCTION,

    Permission.CREATE_ANIMAL_REPRODUCTION,
    Permission.ASSIGN_ROLE,

    Permission.READ_PEN,
    Permission.CREATE_PEN,
    Permission.UPDATE_PEN,
    Permission.DELETE_PEN,

    Permission.READ_BREED,
    Permission.CREATE_BREED,
    Permission.UPDATE_BREED,
    Permission.DELETE_BREED,

    Permission.READ_SPECIES,
    Permission.CREATE_SPECIES,
    Permission.UPDATE_SPECIES,
    Permission.DELETE_SPECIES,

    Permission.READ_HERD,
    Permission.CREATE_HERD,
    Permission.UPDATE_HERD,
    Permission.DELETE_HERD,

    Permission.READ_BARN,
    Permission.CREATE_BARN,
    Permission.UPDATE_BARN,
    Permission.DELETE_BARN,

    Permission.READ_FEEDSTOCK,
    Permission.CREATE_FEEDSTOCK,
    Permission.UPDATE_FEEDSTOCK,
    Permission.DELETE_FEEDSTOCK,

    Permission.READ_TREATMENT,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,

    Permission.READ_VACCINATION,
    Permission.CREATE_VACCINATION,
    Permission.UPDATE_VACCINATION,

    Permission.READ_EQUIPMENT,
    Permission.CREATE_EQUIPMENT,
    Permission.UPDATE_EQUIPMENT,
    Permission.DELETE_EQUIPMENT,

    Permission.READ_MAINTENANCE,
    Permission.CREATE_MAINTENANCE,
    Permission.UPDATE_MAINTENANCE,
    Permission.DELETE_MAINTENANCE,

    Permission.READ_REPORT,
    Permission.CREATE_REPORT,
    Permission.UPDATE_REPORT,
    Permission.DELETE_REPORT,



  ],

  FARM_MANAGER: [
    Permission.READ_FARM,
    Permission.CREATE_FARM,
    Permission.UPDATE_FARM,
    Permission.DELETE_FARM,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,
    Permission.DELETE_ANIMAL,

    Permission.READ_LOT,
    Permission.CREATE_LOT,
    Permission.UPDATE_LOT,
    Permission.DELETE_LOT,

    Permission.READ_PRODUCTION,
    Permission.CREATE_PRODUCTION,
    Permission.UPDATE_PRODUCTION,
    Permission.DELETE_PRODUCTION,

    Permission.READ_FEEDSTOCK,
    Permission.CREATE_FEEDSTOCK,
    Permission.UPDATE_FEEDSTOCK,
    Permission.DELETE_FEEDSTOCK,

    Permission.READ_TREATMENT,

    Permission.READ_VACCINATION,

    Permission.READ_REPORT,
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

  FINANCE_MANAGER: [
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

  STOCK_MANAGER: [
    Permission.READ_FEEDSTOCK,
    Permission.CREATE_FEEDSTOCK,
    Permission.UPDATE_FEEDSTOCK,
    Permission.DELETE_FEEDSTOCK,

    Permission.READ_PRODUCTION,
    Permission.CREATE_PRODUCTION,
    Permission.UPDATE_PRODUCTION,
    Permission.DELETE_PRODUCTION,
  ],

  LOGS_MANAGER: [
    Permission.READ_LOGS,
    Permission.CREATE_LOGS,
    Permission.UPDATE_LOGS,
    Permission.DELETE_LOGS,
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

    const perms =
      rolePermissionsMap[role.name as keyof typeof rolePermissionsMap] || [];

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
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

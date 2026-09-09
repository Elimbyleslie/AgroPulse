import prisma from "../src/models/prismaClient.js";
import { Permission } from "../src/helpers/permissions.js"; // adapte le chemin !

// --- ROLES ---
const roles = [
  { name: "SUPER_ADMIN", description: "Propriétaire de la plateforme Agropulse" },
  { name: "ADMIN", description: "Assiste le SUPER_ADMIN dans la gestion de la plateforme" },
  { name: "ORGANIZATION_OWNER", description: "Propriétaire d'une organisation (scope limité à son org)" },
  { name: "FARM_MANAGER", description: "Gère le fonctionnement quotidien d'une ferme" },
  { name: "FARMER", description: "Assiste le FARM_MANAGER, droits limités" },
  { name: "VETERINARY", description: "Gère uniquement la santé des animaux" },
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

const rolePermissionsMap = {
  // SUPER_ADMIN : propriétaire d'Agropulse, accès total, toutes organisations confondues
  SUPER_ADMIN: permissions.map((p) => p.code),

  // ADMIN : assiste le SUPER_ADMIN au niveau plateforme (pas de gestion des rôles/permissions
  // eux-mêmes, ni des abonnements/plans, réservés au SUPER_ADMIN)
  ADMIN: [
    // Organisations (lecture/màj, pas de suppression ni création libre)
    Permission.READ_ORGANIZATION,
    Permission.UPDATE_ORGANIZATION,

    // Utilisateurs
    Permission.READ_USER,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.READ_USER_ROLES,
    Permission.MANAGE_USERS,
    Permission.READ_FARM_USER,
    Permission.CREATE_FARM_USER,
    Permission.UPDATE_FARM_USER,

    // Rôles / permissions (lecture uniquement)
    Permission.READ_ROLE,
    Permission.READ_PERMISSION,
    Permission.READ_ROLE_PERMISSIONS,

    // Fermes
    Permission.READ_FARM,
    Permission.CREATE_FARM,
    Permission.UPDATE_FARM,

    // Animaux / lots
    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,
    Permission.DELETE_ANIMAL,

    Permission.READ_LOT,
    Permission.CREATE_LOT,
    Permission.UPDATE_LOT,
    Permission.DELETE_LOT,

    // Production / stock / santé (lecture)
    Permission.READ_PRODUCTION,
    Permission.READ_FEEDSTOCK,
    Permission.READ_TREATMENT,
    Permission.READ_VACCINATION,
    Permission.READ_EQUIPMENT,
    Permission.READ_MAINTENANCE,
    Permission.READ_INVENTORY,

    // Finance
    Permission.READ_FINANCIAL_REPORT,
    Permission.CREATE_FINANCIAL_REPORT,
    Permission.UPDATE_FINANCIAL_REPORT,
    Permission.DELETE_FINANCIAL_REPORT,

    Permission.READ_SALE,
    Permission.CREATE_SALE,
    Permission.UPDATE_SALE,
    Permission.DELETE_SALE,

    Permission.READ_EXPENSE,
    Permission.CREATE_EXPENSE,
    Permission.UPDATE_EXPENSE,
    Permission.DELETE_EXPENSE,

    Permission.READ_INVOICE,
    Permission.CREATE_INVOICE,
    Permission.UPDATE_INVOICE,
    Permission.DELETE_INVOICE,

    // Rapports
    Permission.READ_REPORT,
    Permission.CREATE_REPORT,
    Permission.UPDATE_REPORT,
    Permission.DELETE_REPORT,

    // Maintenance
    Permission.CREATE_MAINTENANCE,
    Permission.UPDATE_MAINTENANCE,
    Permission.DELETE_MAINTENANCE,

    // Audit / logs
    Permission.READ_AUDIT,
    Permission.READ_AUDITLOG,

    // Notifications / paramètres / API
    Permission.READ_NOTIFICATION,
    Permission.CREATE_NOTIFICATION,
    Permission.READ_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.READ_API_KEY,
  ],

  // ORGANIZATION_OWNER : scope = uniquement SON organisation (filtrage applicatif requis).
  // Ne gère PAS les plans (lecture seule) ni ne crée/modifie/supprime l'organisation elle-même.
  ORGANIZATION_OWNER: [
    // Organisation : lecture + mise à jour des infos de son org uniquement.
    // Pas de création (l'org est créée à l'inscription) ni de suppression.
    Permission.READ_ORGANIZATION,
    Permission.UPDATE_ORGANIZATION,

    // Abonnement : peut consulter les plans et souscrire, mais ne gère pas les plans eux-mêmes
    Permission.READ_PLAN,
    Permission.READ_SUBSCRIPTION,
    Permission.CREATE_SUBSCRIPTION, // "s'abonner"

    // Utilisateurs de son organisation
    Permission.READ_USER,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.READ_USER_ROLES,
    Permission.MANAGE_USERS,
    Permission.ASSIGN_ROLE,
    Permission.REMOVE_ROLE,
    Permission.READ_FARM_USER,
    Permission.CREATE_FARM_USER,
    Permission.UPDATE_FARM_USER,
    Permission.DELETE_FARM_USER,

    // Structure de la ferme (l'org owner peut créer des fermes dans son org,
    // contrairement au FARM_MANAGER qui ne fait que les gérer)
    Permission.READ_FARM,
    Permission.CREATE_FARM,
    Permission.UPDATE_FARM,
    Permission.DELETE_FARM,

    Permission.READ_BARN,
    Permission.CREATE_BARN,
    Permission.UPDATE_BARN,
    Permission.DELETE_BARN,

    Permission.READ_PEN,
    Permission.CREATE_PEN,
    Permission.UPDATE_PEN,
    Permission.DELETE_PEN,

    Permission.READ_HERD,
    Permission.CREATE_HERD,
    Permission.UPDATE_HERD,
    Permission.DELETE_HERD,

    Permission.READ_BREED,
    Permission.CREATE_BREED,
    Permission.UPDATE_BREED,
    Permission.DELETE_BREED,

    Permission.READ_SPECIES,
    Permission.CREATE_SPECIES,
    Permission.UPDATE_SPECIES,
    Permission.DELETE_SPECIES,

    // Animaux / lots
    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,
    Permission.DELETE_ANIMAL,

    Permission.READ_LOT,
    Permission.CREATE_LOT,
    Permission.UPDATE_LOT,
    Permission.DELETE_LOT,

    Permission.READ_ANIMAL_DEATH,
    Permission.CREATE_ANIMAL_DEATH,
    Permission.UPDATE_ANIMAL_DEATH,
    Permission.DELETE_ANIMAL_DEATH,

    Permission.READ_TRANSFER,
    Permission.CREATE_TRANSFER,
    Permission.UPDATE_TRANSFER,
    Permission.DELETE_TRANSFER,

    Permission.READ_WEIGHT,
    Permission.CREATE_WEIGHT,
    Permission.UPDATE_WEIGHT,
    Permission.DELETE_WEIGHT,

    Permission.READ_MOVEMENT,
    Permission.CREATE_MOVEMENT,
    Permission.UPDATE_MOVEMENT,
    Permission.DELETE_MOVEMENT,

    Permission.READ_PEDIGREE,
    Permission.CREATE_PEDIGREE,
    Permission.UPDATE_PEDIGREE,
    Permission.DELETE_PEDIGREE,

    // Reproduction
    Permission.READ_ANIMAL_REPRODUCTION,
    Permission.CREATE_ANIMAL_REPRODUCTION,
    Permission.UPDATE_ANIMAL_REPRODUCTION,
    Permission.DELETE_ANIMAL_REPRODUCTION,

    Permission.READ_REPRODUCTION,
    Permission.CREATE_REPRODUCTION,
    Permission.UPDATE_REPRODUCTION,
    Permission.DELETE_REPRODUCTION,

    Permission.READ_REPRODUCTION_WITH_BIRTH,
    Permission.CREATE_REPRODUCTION_WITH_BIRTH,
    Permission.UPDATE_REPRODUCTION_WITH_BIRTH,
    Permission.DELETE_REPRODUCTION_WITH_BIRTH,

    Permission.READ_REPRODUCTION_CYCLE,
    Permission.CREATE_REPRODUCTION_CYCLE,
    Permission.UPDATE_REPRODUCTION_CYCLE,
    Permission.DELETE_REPRODUCTION_CYCLE,

    Permission.READ_GESTATION,
    Permission.CREATE_GESTATION,
    Permission.UPDATE_GESTATION,
    Permission.DELETE_GESTATION,

    Permission.READ_GESTATION_CHECKUP,
    Permission.CREATE_GESTATION_CHECKUP,
    Permission.UPDATE_GESTATION_CHECKUP,
    Permission.DELETE_GESTATION_CHECKUP,

    Permission.READ_BIRTH,
    Permission.CREATE_BIRTH,
    Permission.UPDATE_BIRTH,
    Permission.DELETE_BIRTH,

    Permission.READ_GENETIC_PERFORMANCE,
    Permission.CREATE_GENETIC_PERFORMANCE,
    Permission.CALCULATE_GENETIC_PERFORMANCE,
    Permission.UPDATE_GENETIC_PERFORMANCE,
    Permission.DELETE_GENETIC_PERFORMANCE,

    // Production
    Permission.READ_PRODUCTION,
    Permission.CREATE_PRODUCTION,
    Permission.UPDATE_PRODUCTION,
    Permission.DELETE_PRODUCTION,

    Permission.READ_PRODUCTION_RECORD,
    Permission.CREATE_PRODUCTION_RECORD,
    Permission.UPDATE_PRODUCTION_RECORD,
    Permission.DELETE_PRODUCTION_RECORD,

    // Alimentation
    Permission.READ_FEEDSTOCK,
    Permission.CREATE_FEEDSTOCK,
    Permission.UPDATE_FEEDSTOCK,
    Permission.DELETE_FEEDSTOCK,

    Permission.READ_ANIMAL_FEEDING,
    Permission.CREATE_ANIMAL_FEEDING,
    Permission.UPDATE_ANIMAL_FEEDING,
    Permission.DELETE_ANIMAL_FEEDING,

    Permission.READ_FEEDING_PLAN,
    Permission.CREATE_FEEDING_PLAN,
    Permission.UPDATE_FEEDING_PLAN,
    Permission.DELETE_FEEDING_PLAN,

    // Santé
    Permission.READ_HEALTH_RECORD,
    Permission.CREATE_HEALTH_RECORD,
    Permission.UPDATE_HEALTH_RECORD,
    Permission.DELETE_HEALTH_RECORD,

    Permission.READ_TREATMENT,
    Permission.CREATE_TREATMENT,
    Permission.UPDATE_TREATMENT,
    Permission.DELETE_TREATMENT,

    Permission.READ_VACCINATION,
    Permission.CREATE_VACCINATION,
    Permission.UPDATE_VACCINATION,
    Permission.DELETE_VACCINATION,

    // Équipement / maintenance
    Permission.READ_EQUIPMENT,
    Permission.CREATE_EQUIPMENT,
    Permission.UPDATE_EQUIPMENT,
    Permission.DELETE_EQUIPMENT,

    Permission.READ_MAINTENANCE,
    Permission.CREATE_MAINTENANCE,
    Permission.UPDATE_MAINTENANCE,
    Permission.DELETE_MAINTENANCE,

    Permission.READ_EQUIPMENT_MAINTENANCE,
    Permission.CREATE_EQUIPMENT_MAINTENANCE,
    Permission.UPDATE_EQUIPMENT_MAINTENANCE,
    Permission.DELETE_EQUIPMENT_MAINTENANCE,

    // Finance
    Permission.READ_SALE,
    Permission.CREATE_SALE,
    Permission.UPDATE_SALE,
    Permission.DELETE_SALE,

    Permission.READ_SALE_ITEM,
    Permission.CREATE_SALE_ITEM,
    Permission.UPDATE_SALE_ITEM,
    Permission.DELETE_SALE_ITEM,

    Permission.READ_EXPENSE,
    Permission.CREATE_EXPENSE,
    Permission.UPDATE_EXPENSE,
    Permission.DELETE_EXPENSE,

    Permission.READ_EXPENSE_CATEGORY,
    Permission.CREATE_EXPENSE_CATEGORY,
    Permission.UPDATE_EXPENSE_CATEGORY,
    Permission.DELETE_EXPENSE_CATEGORY,

    Permission.READ_FINANCIAL_REPORT,
    Permission.CREATE_FINANCIAL_REPORT,
    Permission.UPDATE_FINANCIAL_REPORT,
    Permission.DELETE_FINANCIAL_REPORT,

    Permission.READ_INVOICE,
    Permission.CREATE_INVOICE,
    Permission.UPDATE_INVOICE,
    Permission.DELETE_INVOICE,

    Permission.READ_PAYMENT,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,
    Permission.DELETE_PAYMENT,

    Permission.READ_PURCHASE,
    Permission.CREATE_PURCHASE,
    Permission.UPDATE_PURCHASE,
    Permission.DELETE_PURCHASE,

    Permission.READ_CLIENT,
    Permission.CREATE_CLIENT,
    Permission.UPDATE_CLIENT,
    Permission.DELETE_CLIENT,

    Permission.READ_SUPPLIER,
    Permission.CREATE_SUPPLIER,
    Permission.UPDATE_SUPPLIER,
    Permission.DELETE_SUPPLIER,

    // Stock / inventaire
    Permission.READ_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.UPDATE_INVENTORY,
    Permission.DELETE_INVENTORY,

    Permission.READ_STOCK_MOVEMENT,
    Permission.CREATE_STOCK_MOVEMENT,
    Permission.UPDATE_STOCK_MOVEMENT,
    Permission.DELETE_STOCK_MOVEMENT,

    Permission.READ_FEED_PURCHASE,
    Permission.CREATE_FEED_PURCHASE,
    Permission.UPDATE_FEED_PURCHASE,
    Permission.DELETE_FEED_PURCHASE,

    Permission.READ_FEED_SUPPLIER,
    Permission.CREATE_FEED_SUPPLIER,
    Permission.UPDATE_FEED_SUPPLIER,
    Permission.DELETE_FEED_SUPPLIER,

    Permission.READ_FEED_USAGE,
    Permission.CREATE_FEED_USAGE,
    Permission.UPDATE_FEED_USAGE,
    Permission.DELETE_FEED_USAGE,

    // Tâches / alertes / rapports
    Permission.READ_FARMTASK,
    Permission.CREATE_FARMTASK,
    Permission.UPDATE_FARMTASK,
    Permission.DELETE_FARMTASK,

    Permission.READ_FARM_TASK,
    Permission.CREATE_FARM_TASK,
    Permission.UPDATE_FARM_TASK,
    Permission.DELETE_FARM_TASK,

    Permission.READ_ALERT,
    Permission.CREATE_ALERT,
    Permission.UPDATE_ALERT,
    Permission.DELETE_ALERT,

    Permission.READ_REPORT,
    Permission.CREATE_REPORT,
    Permission.UPDATE_REPORT,
    Permission.DELETE_REPORT,

    // Audit / logs / notifications / paramètres / API (de son organisation)
    Permission.READ_AUDIT,
    Permission.READ_AUDITLOG,

    Permission.READ_NOTIFICATION,
    Permission.CREATE_NOTIFICATION,
    Permission.UPDATE_NOTIFICATION,
    Permission.DELETE_NOTIFICATION,

    Permission.READ_SETTINGS,
    Permission.CREATE_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.DELETE_SETTINGS,

    Permission.READ_API_KEY,
    Permission.CREATE_API_KEY,
    Permission.UPDATE_API_KEY,
    Permission.DELETE_API_KEY,

    Permission.CREATE_INVITATION,
    Permission.READ_INVITATION,
    Permission.DELETE_INVITATION,

    Permission.READ_FARM_USER,
    Permission.CREATE_FARM_USER,
    Permission.UPDATE_FARM_USER,
    Permission.DELETE_FARM_USER,

    Permission.READ_FARMTASK,
    Permission.CREATE_FARMTASK,
    Permission.UPDATE_FARMTASK,
    Permission.DELETE_FARMTASK,

    Permission.READ_ROLE,
    Permission.CREATE_ROLE,
    Permission.UPDATE_ROLE,
    Permission.DELETE_ROLE,

    Permission.READ_PERMISSION,
    Permission.CREATE_PERMISSION,
    Permission.UPDATE_PERMISSION,
    Permission.DELETE_PERMISSION,

    Permission.READ_USER_ROLES,
    Permission.MANAGE_USERS,
    Permission.ASSIGN_ROLE,
    Permission.REMOVE_ROLE,
    
  ],

  // FARM_MANAGER : assiste le FARM_MANAGER (même logique que ADMIN assistant SUPER_ADMIN),
  // droits limités au travail quotidien sur les animaux, sans gérer la ferme elle seule.
  FARM_MANAGER: [
    // Peut gérer (lire/modifier) sa ferme, mais pas la créer ni la supprimer
    Permission.READ_FARM,
    Permission.UPDATE_FARM,

    Permission.CREATE_INVITATION,
    Permission.READ_INVITATION,
    Permission.DELETE_INVITATION,

    Permission.READ_BARN,
    Permission.CREATE_BARN,
    Permission.UPDATE_BARN,
    Permission.DELETE_BARN,

    Permission.READ_EQUIPMENT,
    Permission.CREATE_EQUIPMENT,
    Permission.UPDATE_EQUIPMENT,
    Permission.DELETE_EQUIPMENT,

    Permission.READ_EQUIPMENT_MAINTENANCE,
    Permission.CREATE_EQUIPMENT_MAINTENANCE,
    Permission.UPDATE_EQUIPMENT_MAINTENANCE,
    Permission.DELETE_EQUIPMENT_MAINTENANCE,

    Permission.READ_PEN,
    Permission.CREATE_PEN,
    Permission.UPDATE_PEN,
    Permission.DELETE_PEN,

    Permission.READ_FARMTASK,
    Permission.CREATE_FARMTASK,
    Permission.UPDATE_FARMTASK,
    Permission.DELETE_FARMTASK,

    Permission.READ_HERD,
    Permission.CREATE_HERD,
    Permission.UPDATE_HERD,
    Permission.DELETE_HERD,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,
    Permission.DELETE_ANIMAL,

    Permission.READ_ANIMAL_DEATH,
    Permission.CREATE_ANIMAL_DEATH,
    Permission.UPDATE_ANIMAL_DEATH,

    Permission.READ_TRANSFER,
    Permission.CREATE_TRANSFER,
    Permission.UPDATE_TRANSFER,

    Permission.READ_WEIGHT,
    Permission.CREATE_WEIGHT,
    Permission.UPDATE_WEIGHT,

    Permission.READ_MOVEMENT,
    Permission.CREATE_MOVEMENT,
    Permission.UPDATE_MOVEMENT,

    Permission.READ_PEDIGREE,

    Permission.READ_LOT,
    Permission.CREATE_LOT,
    Permission.UPDATE_LOT,
    Permission.DELETE_LOT,

    Permission.READ_PRODUCTION,
    Permission.CREATE_PRODUCTION,
    Permission.UPDATE_PRODUCTION,
    Permission.DELETE_PRODUCTION,

    Permission.READ_PRODUCTION_RECORD,
    Permission.CREATE_PRODUCTION_RECORD,
    Permission.UPDATE_PRODUCTION_RECORD,

    Permission.READ_FEEDSTOCK,
    Permission.CREATE_FEEDSTOCK,
    Permission.UPDATE_FEEDSTOCK,
    Permission.DELETE_FEEDSTOCK,

    Permission.READ_ANIMAL_FEEDING,
    Permission.CREATE_ANIMAL_FEEDING,
    Permission.UPDATE_ANIMAL_FEEDING,

    Permission.READ_FEEDING_PLAN,
    Permission.CREATE_FEEDING_PLAN,
    Permission.UPDATE_FEEDING_PLAN,

    // Santé : lecture seule, la gestion appartient au VETERINARY
    Permission.READ_TREATMENT,
    Permission.READ_VACCINATION,

    Permission.READ_ANIMAL_REPRODUCTION,
    Permission.READ_REPRODUCTION,
    Permission.READ_BIRTH,
    Permission.READ_GENETIC_PERFORMANCE,

    Permission.READ_FARMTASK,
    Permission.CREATE_FARMTASK,
    Permission.UPDATE_FARMTASK,
    Permission.DELETE_FARMTASK,

    Permission.READ_FARM_TASK,
    Permission.CREATE_FARM_TASK,
    Permission.UPDATE_FARM_TASK,
    Permission.DELETE_FARM_TASK,

    Permission.READ_ALERT,
    Permission.CREATE_ALERT,
    Permission.UPDATE_ALERT,

    // Rapports : ne peut pas supprimer
    Permission.READ_REPORT,
    Permission.CREATE_REPORT,
    Permission.UPDATE_REPORT,

    Permission.READ_FARM_USER,
    Permission.READ_NOTIFICATION,
  ],

  // FARMER : assiste le FARM_MANAGER (même logique que ADMIN assistant SUPER_ADMIN),
  // droits limités au travail quotidien sur les animaux, sans gérer la ferme elle-même.
  FARMER: [
    Permission.READ_FARM,

    Permission.READ_ANIMAL,
    Permission.CREATE_ANIMAL,
    Permission.UPDATE_ANIMAL,

    Permission.READ_HEALTH_RECORD,

    Permission.READ_FEED_USAGE,
    Permission.CREATE_FEED_USAGE,

    Permission.READ_ANIMAL_FEEDING,
    Permission.CREATE_ANIMAL_FEEDING,

    Permission.READ_FEEDING_PLAN,

    Permission.READ_WEIGHT,
    Permission.CREATE_WEIGHT,

    Permission.READ_FARMTASK,
    Permission.UPDATE_FARMTASK,
    Permission.READ_FARM_TASK,
    Permission.UPDATE_FARM_TASK,

    Permission.READ_NOTIFICATION,
  ],

  // VETERINARY : strictement la santé animale. Peut lire/modifier les animaux
  // (jamais supprimer) et consulter leur plan alimentaire. C'est tout.
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

    Permission.READ_FEEDING_PLAN,
  ],

  FINANCE_MANAGER: [
    Permission.READ_SALE,
    Permission.CREATE_SALE,
    Permission.UPDATE_SALE,
    Permission.DELETE_SALE,

    Permission.READ_SALE_ITEM,
    Permission.CREATE_SALE_ITEM,
    Permission.UPDATE_SALE_ITEM,
    Permission.DELETE_SALE_ITEM,

    Permission.READ_EXPENSE,
    Permission.CREATE_EXPENSE,
    Permission.UPDATE_EXPENSE,
    Permission.DELETE_EXPENSE,

    Permission.READ_EXPENSE_CATEGORY,
    Permission.CREATE_EXPENSE_CATEGORY,
    Permission.UPDATE_EXPENSE_CATEGORY,
    Permission.DELETE_EXPENSE_CATEGORY,

    // Factures / paiements : pas de suppression, ce sont des pièces comptables
    // formelles (annulation réservée à l'ORGANIZATION_OWNER)
    Permission.READ_INVOICE,
    Permission.CREATE_INVOICE,
    Permission.UPDATE_INVOICE,

    Permission.READ_PAYMENT,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,

    Permission.READ_PURCHASE,
    Permission.CREATE_PURCHASE,
    Permission.UPDATE_PURCHASE,

    Permission.READ_CLIENT,
    Permission.CREATE_CLIENT,
    Permission.UPDATE_CLIENT,
    Permission.DELETE_CLIENT,

    Permission.READ_SUPPLIER,
    Permission.CREATE_SUPPLIER,
    Permission.UPDATE_SUPPLIER,

    // Rapport financier : pas de suppression, même logique que DELETE_INVOICE
    Permission.READ_FINANCIAL_REPORT,
    Permission.CREATE_FINANCIAL_REPORT,
    Permission.UPDATE_FINANCIAL_REPORT,

    Permission.READ_REPORT,
    Permission.READ_NOTIFICATION,
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

    Permission.READ_EQUIPMENT_MAINTENANCE,
    Permission.CREATE_EQUIPMENT_MAINTENANCE,
    Permission.UPDATE_EQUIPMENT_MAINTENANCE,
    Permission.DELETE_EQUIPMENT_MAINTENANCE,

    Permission.READ_NOTIFICATION,
  ],

  STOCK_MANAGER: [
    Permission.READ_FEEDSTOCK,
    Permission.CREATE_FEEDSTOCK,
    Permission.UPDATE_FEEDSTOCK,
    Permission.DELETE_FEEDSTOCK,

    Permission.READ_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.UPDATE_INVENTORY,
    Permission.DELETE_INVENTORY,

    Permission.READ_STOCK_MOVEMENT,
    Permission.CREATE_STOCK_MOVEMENT,
    Permission.UPDATE_STOCK_MOVEMENT,
    Permission.DELETE_STOCK_MOVEMENT,

    Permission.READ_FEED_PURCHASE,
    Permission.CREATE_FEED_PURCHASE,
    Permission.UPDATE_FEED_PURCHASE,
    Permission.DELETE_FEED_PURCHASE,

    Permission.READ_FEED_SUPPLIER,
    Permission.CREATE_FEED_SUPPLIER,
    Permission.UPDATE_FEED_SUPPLIER,
    Permission.DELETE_FEED_SUPPLIER,

    Permission.READ_FEED_USAGE,
    Permission.CREATE_FEED_USAGE,
    Permission.UPDATE_FEED_USAGE,
    Permission.DELETE_FEED_USAGE,

    Permission.READ_SUPPLIER,
    Permission.CREATE_SUPPLIER,

    Permission.READ_PURCHASE,
    Permission.CREATE_PURCHASE,

    // Production : enregistrée côté ferme (FARM_MANAGER), le stock manager
    // consulte seulement ce qui entre en stock
    Permission.READ_PRODUCTION,
    Permission.READ_PRODUCTION_RECORD,

    Permission.READ_MOVEMENT,
    Permission.CREATE_MOVEMENT,

    Permission.READ_NOTIFICATION,
  ],

  LOGS_MANAGER: [
    Permission.READ_LOGS,
    Permission.CREATE_LOGS,
    Permission.UPDATE_LOGS,
    Permission.DELETE_LOGS,

    Permission.READ_AUDIT,
    Permission.READ_AUDITLOG,
    Permission.CREATE_AUDITLOG,
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

    // Dédoublonnage (certains codes peuvent apparaître 2x dans les tableaux ci-dessus)
    const perms = [
      ...new Set(
        rolePermissionsMap[role.name as keyof typeof rolePermissionsMap] || []
      ),
    ];

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
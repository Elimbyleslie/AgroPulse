import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const migrateOrgOwnerRole = async () => {
  console.log("🚀 Début migration rôle ORGANIZATION_OWNER...");

  // 1. Récupérer le rôle
  const role = await prisma.role.findUnique({
    where: { name: "ORGANIZATION_OWNER" },
  });

  if (!role) {
    console.error("❌ Rôle ORGANIZATION_OWNER introuvable — lance d'abord le seed");
    process.exit(1);
  }

  // 2. Trouver tous les owners d'organisation qui n'ont PAS encore ce rôle
  const ownersWithoutRole = await prisma.user.findMany({
    where: {
      ownedOrganizations: { some: {} },
      roles: {
        none: { roleId: role.id },
      },
    },
    select: { id: true, name: true, email: true },
  });

  if (ownersWithoutRole.length === 0) {
    console.log("✅ Aucun user à migrer — tout est déjà à jour");
    process.exit(0);
  }

  console.log(`📋 ${ownersWithoutRole.length} user(s) à migrer :`, ownersWithoutRole);

  // 3. Assigner le rôle en masse
  const result = await prisma.userRole.createMany({
    data: ownersWithoutRole.map((user:any) => ({
      userId: user.id,
      roleId: role.id,
      assignedBy: "MIGRATION_SCRIPT",
    })),
    skipDuplicates: true, // Sécurité supplémentaire
  });

  console.log(`✅ ${result.count} rôle(s) assigné(s) avec succès`);
};

migrateOrgOwnerRole()
  .catch((e) => {
    console.error("❌ Erreur migration:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
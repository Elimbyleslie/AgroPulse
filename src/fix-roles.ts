import  prisma  from  "./models/prismaClient.js";


async function repair() {
  const USER_ID = 1; // Ton ID vu dans le JSON
  
  console.log("🛠 Réparation du rôle pour l'utilisateur...", USER_ID);

  // 1. Trouver le rôle en BD
  const role = await prisma.role.findUnique({
    where: { name: "ORGANIZATION_OWNER" }
  });

  if (!role) {
    console.log("❌ Le rôle ORGANIZATION_OWNER n'existe pas dans la table Role !");
    return;
  }

  // 2. Créer l'entrée dans UserRole
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: USER_ID,
        roleId: role.id
      }
    },
    update: {}, // Ne rien faire si ça existe déjà
    create: {
      userId: USER_ID,
      roleId: role.id,
      assignedBy: "MANUAL_REPAIR"
    }
  });

  console.log("✅ Rôle assigné avec succès dans la table UserRole !");
}

repair()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
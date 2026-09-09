declare const process: {
  exit(code?: number): never;
};
import prisma from "../src/models/prismaClient.js";

async function main() {
  console.log("🌱 Seed des clients en cours...");

  const farmId = 1;

  // Vérifier que la ferme existe
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) {
    throw new Error(`La ferme avec l'ID ${farmId} n'existe pas. Créez-la d'abord.`);
  }

  const clientsData = [
    {
      farmId,
      name: "Marché Central de Dakar",
      email: "achats@marchecentral.sn",
      phone: "+221 33 821 45 67",
      address: "Avenue Blaise Diagne, Dakar",
    },
    {
      farmId,
      name: "Restaurant Le Baobab",
      email: "commande@lebaobab.sn",
      phone: "+221 77 123 45 67",
      address: "Almadies, Dakar",
    },
    {
      farmId,
      name: "Supermarché Auchan Mermoz",
      email: "fournisseurs@auchan.sn",
      phone: "+221 33 869 00 00",
      address: "Mermoz, Dakar",
    },
    {
      farmId,
      name: "Boucherie Moderne",
      email: "boucherie.moderne@gmail.com",
      phone: "+221 76 543 21 09",
      address: "Parcelles Assainies, Dakar",
    },
    {
      farmId,
      name: "Hôtel Terrou-Bi",
      email: "cuisine@terroubi.com",
      phone: "+221 33 839 90 39",
      address: "Route de la Corniche Ouest, Dakar",
    },
    {
      farmId,
      name: "Coopérative Laitière du Sahel",
      email: "contact@laitiersahel.sn",
      phone: "+221 77 890 12 34",
      address: "Thiès, Sénégal",
    },
    {
      farmId,
      name: "Mme Aïssatou Diop",
      email: "aissatou.diop@email.com",
      phone: "+221 78 234 56 78",
      address: "Pikine, Dakar",
    },
    {
      farmId,
      name: "M. Ibrahima Ndiaye",
      email: null,
      phone: "+221 70 987 65 43",
      address: "Rufisque",
    },
    {
      farmId,
      name: "Cantine Scolaire Lycée Blaise Diagne",
      email: "cantine@lyceediagne.sn",
      phone: "+221 33 825 10 20",
      address: "Grand Dakar",
    },
    {
      farmId,
      name: "Export Agri-Sénégal",
      email: "export@agrisenegal.com",
      phone: "+221 33 840 55 55",
      address: "Zone Franche de Dakar",
    },
  ];

  let createdCount = 0;

  for (const client of clientsData) {
    // Éviter les doublons par nom + ferme
    const exists = await prisma.client.findFirst({
      where: {
        name: client.name,
        farmId: client.farmId,
      },
    });

    if (exists) {
      console.log(`⏭️  Client "${client.name}" existe déjà → ignoré`);
      continue;
    }

    const created = await prisma.client.create({
      data: client,
    });

    createdCount++;
    console.log(`✅ Client créé : ${created.name} (ID: ${created.id})`);
  }

  console.log(`\n🎉 Seed terminé ! ${createdCount} clients créés pour la ferme ID ${farmId}.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed clients :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
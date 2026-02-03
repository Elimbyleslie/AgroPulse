import prisma from "../src/models/prismaClient.js";

async function main() {
  // 1️⃣ Espèces
  await prisma.species.createMany({
    data: [
      { code: "BOVIN", name: "Bovin" },
      { code: "CAPRIN", name: "Caprin" },
      { code: "OVIN", name: "Ovin" },
      { code: "PORCIN", name: "Porcin" },
      { code: "VOLAILLE", name: "Volaille" },
    ],
    skipDuplicates: true,
  });

  // 2️⃣ Récupération des espèces
  const bovin = await prisma.species.findFirst({ where: { code: "BOVIN" } });
  const caprin = await prisma.species.findFirst({ where: { code: "CAPRIN" } });
  const ovine = await prisma.species.findFirst({ where: { code: "OVIN" } });
  const porcin = await prisma.species.findFirst({ where: { code: "PORCIN" } });
  const volaille = await prisma.species.findFirst({
    where: { code: "VOLAILLE" },
  });

  // 3️⃣ Races
  await prisma.breed.createMany({
    data: [
      // 🐄 Bovins (fréquent en Afrique)
      { name: "Zébu", speciesId: bovin!.id },
      { name: "N'Dama", speciesId: bovin!.id },
      { name: "Girolando", speciesId: bovin!.id },
      { name: "Holstein", speciesId: bovin!.id },

      // 🐐 Caprins
      { name: "Chèvre naine africaine", speciesId: caprin!.id },
      { name: "Sahelienne", speciesId: caprin!.id },
      { name: "Boer", speciesId: caprin!.id },
      { name: "Saanen", speciesId: caprin!.id },

      // 🐑 Ovins
      { name: "Djallonké", speciesId: ovine!.id },
      { name: "Touabire", speciesId: ovine!.id },
      { name: "Mérinos", speciesId: ovine!.id },
      { name: "Dorper", speciesId: ovine!.id },

      // 🐖 Porcins
      { name: "Large White", speciesId: porcin!.id },
      { name: "Landrace", speciesId: porcin!.id },
      { name: "Duroc", speciesId: porcin!.id },

      // 🐔 Volailles
      { name: "Poulet de chair", speciesId: volaille!.id },
      { name: "Poule pondeuse", speciesId: volaille!.id },
      { name: "Poulet local africain", speciesId: volaille!.id },
      { name: "Dinde", speciesId: volaille!.id },
      { name: "Canard", speciesId: volaille!.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed terminé 🚀");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

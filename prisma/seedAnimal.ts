declare const process: {
  exit(code?: number): never;
};

import prisma from "../src/models/prismaClient.js";

async function main() {
  console.log("🌱 Seed des animaux en cours...");

  const bovin = await prisma.species.findFirst({ where: { code: "BOVIN" } });
  const caprin = await prisma.species.findFirst({ where: { code: "CAPRIN" } });
  const ovin = await prisma.species.findFirst({ where: { code: "OVIN" } });
  const porcin = await prisma.species.findFirst({ where: { code: "PORCIN" } });
  const volaille = await prisma.species.findFirst({
    where: { code: "VOLAILLE" },
  });

  if (!bovin || !caprin || !ovin || !porcin || !volaille) {
    throw new Error(
      "Les espèces n'ont pas encore été seedées. Lancez d'abord le seed des species/breeds.",
    );
  }

  // 2️⃣ Récupérer quelques races
  const zebu = await prisma.breed.findFirst({
    where: { name: "Zébu", speciesId: bovin.id },
  });
  const ndama = await prisma.breed.findFirst({
    where: { name: "N'Dama", speciesId: bovin.id },
  });
  const holstein = await prisma.breed.findFirst({
    where: { name: "Holstein", speciesId: bovin.id },
  });

  const chevreNaine = await prisma.breed.findFirst({
    where: { name: "Chèvre naine africaine", speciesId: caprin.id },
  });
  const sahelienne = await prisma.breed.findFirst({
    where: { name: "Sahelienne", speciesId: caprin.id },
  });

  const djallonke = await prisma.breed.findFirst({
    where: { name: "Djallonké", speciesId: ovin.id },
  });
  const dorper = await prisma.breed.findFirst({
    where: { name: "Dorper", speciesId: ovin.id },
  });

  const largeWhite = await prisma.breed.findFirst({
    where: { name: "Large White", speciesId: porcin.id },
  });
  const duroc = await prisma.breed.findFirst({
    where: { name: "Duroc", speciesId: porcin.id },
  });

  const pouletChair = await prisma.breed.findFirst({
    where: { name: "Poulet de chair", speciesId: volaille.id },
  });
  const poulePondeuse = await prisma.breed.findFirst({
    where: { name: "Poule pondeuse", speciesId: volaille.id },
  });
  const pouletLocal = await prisma.breed.findFirst({
    where: { name: "Poulet local africain", speciesId: volaille.id },
  });

  // 3️⃣ Création des animaux (farmId = 1)
  const animalsData: any = [
    // ── Bovins ──────────────────────────────────────────────
    {
      name: "Bella",
      farmId: 1,
      speciesId: bovin.id,
      breedId: zebu?.id,
      gender: "female",
      birthDate: new Date("2021-03-15"),
      weight: 320,
      status: "active",
    },
    {
      name: "Toro",
      farmId: 1,
      speciesId: bovin.id,
      breedId: ndama?.id,
      gender: "male",
      birthDate: new Date("2020-07-22"),
      weight: 410,
      status: "active",
    },
    {
      name: "Laitière",
      farmId: 1,
      speciesId: bovin.id,
      breedId: holstein?.id,
      gender: "female",
      birthDate: new Date("2022-01-10"),
      weight: 480,
      status: "active",
    },

    // ── Caprins ─────────────────────────────────────────────
    {
      name: "Mina",
      farmId: 1,
      speciesId: caprin.id,
      breedId: chevreNaine?.id,
      gender: "female",
      birthDate: new Date("2023-05-08"),
      weight: 28,
      status: "active",
    },
    {
      name: "Sahel",
      farmId: 1,
      speciesId: caprin.id,
      breedId: sahelienne?.id,
      gender: "male",
      birthDate: new Date("2022-11-19"),
      weight: 45,
      status: "active",
    },

    // ── Ovins ───────────────────────────────────────────────
    {
      name: "Djallo",
      farmId: 1,
      speciesId: ovin.id,
      breedId: djallonke?.id,
      gender: "male",
      birthDate: new Date("2023-02-14"),
      weight: 38,
      status: "active",
    },
    {
      name: "Dorine",
      farmId: 1,
      speciesId: ovin.id,
      breedId: dorper?.id,
      gender: "female",
      birthDate: new Date("2023-08-03"),
      weight: 42,
      status: "active",
    },

    // ── Porcins ─────────────────────────────────────────────
    {
      name: "Porky",
      farmId: 1,
      speciesId: porcin.id,
      breedId: largeWhite?.id,
      gender: "male",
      birthDate: new Date("2024-01-20"),
      weight: 95,
      status: "active",
    },
    {
      name: "Rosa",
      farmId: 1,
      speciesId: porcin.id,
      breedId: duroc?.id,
      gender: "female",
      birthDate: new Date("2023-12-05"),
      weight: 110,
      status: "active",
    },

    // ── Volailles ───────────────────────────────────────────
    {
      name: "Chair-01",
      farmId: 1,
      speciesId: volaille.id,
      breedId: pouletChair?.id,
      gender: "male",
      birthDate: new Date("2025-06-10"),
      weight: 2.4,
      status: "active",
    },
    {
      name: "Pondeuse-A1",
      farmId: 1,
      speciesId: volaille.id,
      breedId: poulePondeuse?.id,
      gender: "female",
      birthDate: new Date("2025-03-18"),
      weight: 1.8,
      status: "active",
    },
    {
      name: "Local-12",
      farmId: 1,
      speciesId: volaille.id,
      breedId: pouletLocal?.id,
      gender: "female",
      birthDate: new Date("2025-04-02"),
      weight: 1.5,
      status: "active",
    },
  ];

  // 4️⃣ Insertion
  let createdCount = 0;

  for (const animal of animalsData) {
    // Éviter les doublons par nom + ferme
    const exists = await prisma.animal.findFirst({
      where: {
        name: animal.name,
        farmId: animal.farmId,
      },
    });

    if (exists) {
      console.log(`⏭️  Animal "${animal.name}" existe déjà → ignoré`);
      continue;
    }

    const created = await prisma.animal.create({
      data: {
        ...animal,
      },
    });

    const qrValue = `ANIMAL:${created.id}:SEED`;
    await prisma.animal.update({
      where: { id: created.id },
      data: { qrcode: qrValue },
    });

    createdCount++;
    console.log(`✅ Animal créé : ${created.name} (ID: ${created.id})`);
  }

  console.log(
    `\n🎉 Seed terminé ! ${createdCount} animaux créés sur la ferme ID 1.`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed animaux :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import {  Gender, AnimalStatus} from "../generated/prisma/enums.js"

const prisma = new PrismaClient();

async function main() {
  console.log('Début du seeding des animaux...');

  const animalsData = Array.from({ length: 20 }).map((_, i) => {
    const id = i + 1;
    // Alternance entre farmId 1 et 2
    const farmId = (i % 2) === 0 ? 1 : 2;
    
    // On alterne les genres pour avoir des mâles et des femelles
    const gender = i % 2 === 0 ? Gender.male : Gender.female;
    
    // On alterne les espèces (en supposant que les IDs 1 et 2 existent déjà)
    const speciesId = i < 10 ? 1 : 2;

    return {
      name: `REF-${id.toString().padStart(3, '0')}`, // Utilisation de références comme demandé
      farmId: farmId,
      speciesId: speciesId,
      gender: gender,
      status: AnimalStatus.active,
      qrcode: `QR-ANIMAL-${id}-${Math.random().toString(36).substring(7)}`,
      birthDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
      weight: parseFloat((Math.random() * (500 - 30) + 30).toFixed(2)), // Poids entre 30 et 500kg
      createdAt: new Date(),
    };
  });

  for (const animal of animalsData) {
    await prisma.animal.upsert({
      where: { qrcode: animal.qrcode },
      update: {},
      create: animal,
    });
  }

  console.log('Seed terminé : 20 animaux ajoutés avec succès.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
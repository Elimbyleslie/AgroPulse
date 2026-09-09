import prisma from "../src/models/prismaClient.js";
import { UnitStorage} from "../src/typages/plan.js"

// --- PLANS ---
// Basé sur src/pages/Tarifs.tsx
//
// NOTE : le modèle Plan n'a pas de champ dédié pour le nombre de fermes
// (contrairement à userLimit / animalLimit / storageLimit). Cette info
// ("1 ferme", "3 fermes", "illimité") est donc conservée uniquement dans
// `description`. Si tu veux la piloter côté logique métier (ex: bloquer la
// création d'une 2e ferme), il faudra ajouter un champ `farmLimit` au modèle.

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}


interface PlanSeed {
  name: string;
  price: number;
  durationDays: number;
  description: string;
  billingCycle: BillingCycle;
  userLimit: number | null;
  storageLimit: number | null;
  animalLimit: number | null;
  farmLimit: number | null;
  unitStorage: UnitStorage;
}

const plans: PlanSeed[] = [
  {
    name: "Découverte",
    price: 0,
    durationDays: 30,
    description:
      "Idéal pour tester AgroPulse sur une petite exploitation. 1 ferme, suivi de base des tâches, support communautaire.",
    billingCycle: BillingCycle.MONTHLY,
    userLimit: 1,
    storageLimit: 500,
    animalLimit: 20,
    farmLimit: 1,
    unitStorage: UnitStorage.MO,

  },
  {
    name: "Essentiel",
    price: 5000,
    durationDays: 30,
    description:
      "Pour les petites exploitations en croissance. 2 fermes, notifications & rappels, rapports mensuels, support par email.",
    billingCycle: BillingCycle.MONTHLY,
    userLimit: 10,
    storageLimit: 150,
    animalLimit: 300,
    farmLimit: 2,
    unitStorage: UnitStorage.GO,

  },
  {
    name: "Professionnel",
    price: 10000,
    durationDays: 30,
    description:
      "Le plus choisi par les exploitants sérieux. 3 Fermes et 1000 animaux , gestion multi-utilisateurs, statistiques avancées, support prioritaire.",
    billingCycle: BillingCycle.MONTHLY,
    userLimit: 75,
    storageLimit:600,
    animalLimit: 1000,
    farmLimit: 3,
    unitStorage: UnitStorage.GO,
  },
  {
    name: "Entreprise",
    price: 15000,
    durationDays: 30,
    description:
      "Pour les grandes entreprises. 5 Fermes et 3000 animaux, gestion multi-utilisateurs, statistiques avancées, support prioritaire.",
    billingCycle: BillingCycle.MONTHLY,
    userLimit: 100,
    storageLimit: 1,
    animalLimit: 3000,
    farmLimit: 5,
   unitStorage: UnitStorage.TO,  
  },
];

async function main() {
  console.log("🌱 Seeding plans...");

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { name: plan.name, billingCycle: plan.billingCycle },
    });

    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: plan,
      });
    } else {
      await prisma.plan.create({ data: plan });
    }
  }

  console.log("✅ Seeding des plans terminé !");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
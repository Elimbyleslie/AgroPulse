import prisma from "../src/models/prismaClient.js";


interface PlanSeed {
  code: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number | null;
  currency: string;
  maxUsers: number | null;
  maxAnimals: number | null;
  maxFarms: number | null;
  features: Record<string, unknown> | null;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
}

const plans: PlanSeed[] = [
  {
    code: "DECOUVERTE",
    name: "Découverte",
    description:
      "Idéal pour tester AgroPulse sur une petite exploitation. 1 ferme, suivi de base des tâches, support communautaire.",
    priceMonthly: 0,
    priceYearly: 0,
    currency: "XAF",
    maxUsers: 1,
    maxAnimals: 20,
    maxFarms: 1,
    features: null,
    isActive: true,
    isPublic: true,
    sortOrder: 0,
  },
  {
    code: "ESSENTIEL",
    name: "Essentiel",
    description:
      "Pour les petites exploitations en croissance. 2 fermes, notifications & rappels, rapports mensuels, support par email.",
    priceMonthly: 5000,
    priceYearly: 40000,
    currency: "XAF",
    maxUsers: 10,
    maxAnimals: 300,
    maxFarms: 2,
    features: null,
    isActive: true,
    isPublic: true,
    sortOrder: 1,
  },
  {
    code: "PROFESSIONNEL",
    name: "Professionnel",
    description:
      "Le plus choisi par les exploitants sérieux. 3 fermes et 1000 animaux, gestion multi-utilisateurs, statistiques avancées, support prioritaire.",
    priceMonthly: 10000,
    priceYearly: 100000,
    currency: "XAF",
    maxUsers: 75,
    maxAnimals: 1000,
    maxFarms: 3,
    features: null,
    isActive: true,
    isPublic: true,
    sortOrder: 2,
  },
  {
    code: "ENTREPRISE",
    name: "Entreprise",
    description:
      "Pour les grandes entreprises. 5 fermes et 3000 animaux, gestion multi-utilisateurs, statistiques avancées, support prioritaire.",
    priceMonthly: 15000,
    priceYearly: 120000,
    currency: "XAF",
    maxUsers: 100,
    maxAnimals: 3000,
    maxFarms: 5,
    features: null,
    isActive: true,
    isPublic: true,
    sortOrder: 3,
  },
];

async function main() {
  console.log("🌱 Seeding plans...");

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { code: plan.code },
    });

    if (existing) {
      await prisma.plan.update({
        where: { id: existing.id },
        data: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          currency: plan.currency,
          maxUsers: plan.maxUsers,
          maxAnimals: plan.maxAnimals,
          maxFarms: plan.maxFarms,
          isActive: plan.isActive,
          isPublic: plan.isPublic,
          sortOrder: plan.sortOrder,
        },
      });
    } else {
      await prisma.plan.create({
        data: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          priceMonthly: plan.priceMonthly,
          priceYearly: plan.priceYearly,
          currency: plan.currency,
          maxUsers: plan.maxUsers,
          maxAnimals: plan.maxAnimals,
          maxFarms: plan.maxFarms,
          isActive: plan.isActive,
          isPublic: plan.isPublic,
          sortOrder: plan.sortOrder,
        },
      });
    }
  }

  console.log("✅ Seeding des plans terminé !");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
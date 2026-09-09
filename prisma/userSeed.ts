declare const process: {
  exit(code?: number): never;
};

import prisma from "../src/models/prismaClient.js";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";

import { AuthProvider, UserStatus } from "../src/typages/user.js";
async function main() {
  console.log("🌱 Seeding users...");

  const password = await bcrypt.hash("Password123!", 10);

  const users = [
    {
      name: " Admin Agropulse",
      userName: "admin",
      email: "admin@agropulse.com",
      password,
      phone: "+2370700000001",
      provider: AuthProvider.LOCAL,
      emailVerified: true,
      onboardingComplete: true,
      status: UserStatus.active,
      defaultFarmId: 1,
      defaultOrganizationId: 1,
    },
    {
      name: "Jean Kouassi",
      userName: "jkouassi",
      email: "jean.kouassi@agropulse.com",
      password,
      phone: "+2370700000002",
      provider: AuthProvider.LOCAL,
      emailVerified: true,
      onboardingComplete: true,
      status: UserStatus.active,
      defaultFarmId: 1,
      defaultOrganizationId: 1,
    },
    {
      name: "Awa Traoré",
      userName: "atraore",
      email: "awa.traore@agropulse.com",
      password,
      phone: "+2370700000003",
      provider: AuthProvider.LOCAL,
      emailVerified: true,
      onboardingComplete: false,
      status: UserStatus.active,
      defaultFarmId: 1,
      defaultOrganizationId: 1,
    },
    {
      name: "Dr. Koné Vétérinaire",
      userName: "drkone",
      email: "dr.kone@agropulse.com",
      password,
      phone: "+2370700000004",
      provider: AuthProvider.LOCAL,
      emailVerified: true,
      onboardingComplete: true,
      status: UserStatus.active,
    },
    {
      name: "Marie Yao",
      userName: "myao",
      email: "marie.yao@agropulse.com",
      password,
      phone: "+2370700000005",
      provider: AuthProvider.LOCAL,
      emailVerified: false,
      onboardingComplete: false,
      status: UserStatus.active,
      defaultFarmId: 1,
      defaultOrganizationId: 1,
    },
    {
      name: "Utilisateur Inactif",
      userName: "inactif",
      email: "inactif@agropulse.com",
      password,
      phone: "+2370700000006",
      provider: AuthProvider.LOCAL,
      emailVerified: true,
      onboardingComplete: true,
      status: UserStatus.inactive, 
      defaultFarmId: 1,
      defaultOrganizationId: 1,
    },
  ];

  for (const user of users) {
    const created = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`✅ User créé/existant : ${created.email} (id: ${created.id})`);
  }

  console.log("🌱 Seed users terminé.");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

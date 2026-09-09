// script one-shot, ex: scripts/reset-inventory-status.ts
import prisma from "../src/models/prismaClient.js";

async function main() {
  const result = await prisma.inventory.updateMany({
    data: { status: null },
  });
  console.log(`${result.count} articles mis à jour`);
}

main().finally(() => prisma.$disconnect());
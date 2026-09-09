declare const process: {
  exit(code?: number): never;
};

import prisma from "../src/models/prismaClient.js";
import { Decimal } from "@prisma/client/runtime/library";

async function main() {
  console.log("🌱 Seed FeedStock (10) + Production (10) + Expense (10)...\n");

  const farmId = 1;

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) throw new Error(`Ferme ID ${farmId} introuvable`);

  // ═══════════════════════════════════════════════════════════
  // 1. FEEDSTOCK — 10 stocks
  // ═══════════════════════════════════════════════════════════
  console.log("📦 FeedStock...");

  const feedStocks = [
    {
      farmId,
      name: "Maïs grain",
      category: "CONCENTRATE" as const,
      quantity: new Decimal(2500),
      unit: "kg",
      minQuantity: new Decimal(300),
      unitPrice: new Decimal(220),
      totalValue: new Decimal(550000),
      location: "Silo A",
      sku: "FEED-MAIS-001",
      status: "IN_STOCK" as const,
      expiryDate: new Date("2027-06-30"),
      notes: "Maïs jaune local",
    },
    {
      farmId,
      name: "Tourteau de soja",
      category: "CONCENTRATE" as const,
      quantity: new Decimal(1200),
      unit: "kg",
      minQuantity: new Decimal(200),
      unitPrice: new Decimal(380),
      totalValue: new Decimal(456000),
      location: "Silo B",
      sku: "FEED-SOJA-001",
      status: "IN_STOCK" as const,
      expiryDate: new Date("2027-03-15"),
    },
    {
      farmId,
      name: "Foin de panicum",
      category: "FORAGE" as const,
      quantity: new Decimal(800),
      unit: "kg",
      minQuantity: new Decimal(150),
      unitPrice: new Decimal(120),
      totalValue: new Decimal(96000),
      location: "Hangar fourrage",
      sku: "FEED-FOIN-001",
      status: "IN_STOCK" as const,
    },
    {
      farmId,
      name: "Ensilage de maïs",
      category: "SILAGE" as const,
      quantity: new Decimal(5000),
      unit: "kg",
      minQuantity: new Decimal(500),
      unitPrice: new Decimal(80),
      totalValue: new Decimal(400000),
      location: "Silo ensilage",
      sku: "FEED-ENSIL-001",
      status: "IN_STOCK" as const,
      expiryDate: new Date("2026-12-31"),
    },
    {
      farmId,
      name: "CMV Bovins",
      category: "MINERAL" as const,
      quantity: new Decimal(150),
      unit: "kg",
      minQuantity: new Decimal(30),
      unitPrice: new Decimal(850),
      totalValue: new Decimal(127500),
      location: "Magasin minéraux",
      sku: "FEED-CMV-001",
      status: "IN_STOCK" as const,
    },
    {
      farmId,
      name: "Son de blé",
      category: "SUPPLEMENT" as const,
      quantity: new Decimal(80),
      unit: "kg",
      minQuantity: new Decimal(100),
      unitPrice: new Decimal(150),
      totalValue: new Decimal(12000),
      location: "Silo C",
      sku: "FEED-SON-001",
      status: "LOW_STOCK" as const,
    },
    {
      farmId,
      name: "Paille de riz",
      category: "FORAGE" as const,
      quantity: new Decimal(0),
      unit: "kg",
      minQuantity: new Decimal(200),
      unitPrice: new Decimal(50),
      totalValue: new Decimal(0),
      location: "Hangar fourrage",
      sku: "FEED-PAILLE-001",
      status: "OUT_OF_STOCK" as const,
    },
    {
      farmId,
      name: "Protéines volaille",
      category: "CONCENTRATE" as const,
      quantity: new Decimal(400),
      unit: "kg",
      minQuantity: new Decimal(80),
      unitPrice: new Decimal(420),
      totalValue: new Decimal(168000),
      location: "Silo volaille",
      sku: "FEED-PROT-VOL-001",
      status: "IN_STOCK" as const,
    },
    {
      farmId,
      name: "Sel gemme",
      category: "MINERAL" as const,
      quantity: new Decimal(60),
      unit: "kg",
      minQuantity: new Decimal(20),
      unitPrice: new Decimal(200),
      totalValue: new Decimal(12000),
      location: "Magasin minéraux",
      sku: "FEED-SEL-001",
      status: "IN_STOCK" as const,
    },
    {
      farmId,
      name: "Mélange porcin",
      category: "CONCENTRATE" as const,
      quantity: new Decimal(900),
      unit: "kg",
      minQuantity: new Decimal(150),
      unitPrice: new Decimal(310),
      totalValue: new Decimal(279000),
      location: "Silo porcs",
      sku: "FEED-PORC-001",
      status: "IN_STOCK" as const,
      expiryDate: new Date("2027-01-31"),
    },
  ];

  let feedCount = 0;
  for (const item of feedStocks) {
    const exists = await prisma.feedStock.findFirst({ where: { sku: item.sku } });
    if (exists) {
      console.log(`   ⏭️  ${item.name}`);
      continue;
    }
    await prisma.feedStock.create({ data: item });
    feedCount++;
    console.log(`   ✅ ${item.name}`);
  }
  console.log(`   → ${feedCount} FeedStock créés\n`);

  // ═══════════════════════════════════════════════════════════
  // 2. PRODUCTION — 10 productions liées aux vrais animaux
  // ═══════════════════════════════════════════════════════════
  console.log("🥛 Production...");

  // Animaux réels (IDs confirmés)
  // 1: VB-09 (Girolando ♀), 2: Bella (Zébu ♀), 4: Laitière (Holstein ♀)
  // 12: Pondeuse-A1, 9: Porky, 10: Rosa, 11: Chair-01

  const productions = [
    {
      farmId,
      animalId: 4, // Laitière (Holstein)
      date: new Date("2026-08-25"),
      category: "Product" as const,
      type: "Lait",
      quantity: 22.5,
      unit: "L",
      qualityGrade: "A",
      notes: "Traite matin — Laitière",
    },
    {
      farmId,
      animalId: 4,
      date: new Date("2026-08-25"),
      category: "Product" as const,
      type: "Lait",
      quantity: 18.0,
      unit: "L",
      qualityGrade: "A",
      notes: "Traite soir — Laitière",
    },
    {
      farmId,
      animalId: 1, // VB-09 (Girolando)
      date: new Date("2026-08-26"),
      category: "Product" as const,
      type: "Lait",
      quantity: 16.5,
      unit: "L",
      qualityGrade: "A",
      notes: "Traite matin — VB-09",
    },
    {
      farmId,
      animalId: 2, // Bella (Zébu)
      date: new Date("2026-08-26"),
      category: "Product" as const,
      type: "Lait",
      quantity: 8.0,
      unit: "L",
      qualityGrade: "B",
      notes: "Traite matin — Bella",
    },
    {
      farmId,
      animalId: 12, // Pondeuse-A1
      date: new Date("2026-08-27"),
      category: "Product" as const,
      type: "Œufs",
      quantity: 1,
      unit: "unité",
      qualityGrade: "Extra",
      notes: "Ponte journalière — Pondeuse-A1",
    },
    {
      farmId,
      animalId: 12,
      date: new Date("2026-08-28"),
      category: "Product" as const,
      type: "Œufs",
      quantity: 1,
      unit: "unité",
      qualityGrade: "Extra",
      notes: "Ponte journalière — Pondeuse-A1",
    },
    {
      farmId,
      animalId: 9, // Porky
      date: new Date("2026-08-20"),
      category: "Product" as const,
      type: "Porc vif",
      quantity: 95,
      unit: "kg",
      qualityGrade: "Standard",
      notes: "Pesée / estimation — Porky",
    },
    {
      farmId,
      animalId: 10, // Rosa
      date: new Date("2026-08-22"),
      category: "Product" as const,
      type: "Porc vif",
      quantity: 110,
      unit: "kg",
      qualityGrade: "Standard",
      notes: "Pesée — Rosa",
    },
    {
      farmId,
      animalId: 11, // Chair-01
      date: new Date("2026-08-24"),
      category: "Product" as const,
      type: "Poulet de chair",
      quantity: 2.4,
      unit: "kg",
      qualityGrade: "A",
      notes: "Pesée — Chair-01",
    },
    {
      farmId,
      animalId: null, // sous-produit global
      date: new Date("2026-08-28"),
      category: "byproduct" as const,
      type: "Fumier",
      quantity: 1.2,
      unit: "tonne",
      qualityGrade: null,
      notes: "Collecte hebdomadaire — ensemble du cheptel",
    },
  ];

  let prodCount = 0;
  for (const p of productions) {
    await prisma.production.create({ data: p });
    prodCount++;
    console.log(`   ✅ ${p.type} ${p.quantity} ${p.unit} (animalId: ${p.animalId ?? "—"})`);
  }
  console.log(`   → ${prodCount} Production créées\n`);

  // ═══════════════════════════════════════════════════════════
  // 3. EXPENSE — 10 dépenses
  // ═══════════════════════════════════════════════════════════
  console.log("💰 Expense...");

  const expenses = [
    {
      farmId,
      category: "FEED" as const,
      amount: 550000,
      taxAmount: 0,
      totalAmount: 550000,
      date: new Date("2026-08-01"),
      paymentMethod: "mobile_money" as const,
      invoiceNumber: "FAC-FEED-001",
      notes: "Achat maïs grain 2,5 t",
      isRecurring: false,
    },
    {
      farmId,
      category: "FEED" as const,
      amount: 456000,
      taxAmount: 0,
      totalAmount: 456000,
      date: new Date("2026-08-05"),
      paymentMethod: "cash" as const,
      invoiceNumber: "FAC-FEED-002",
      notes: "Achat tourteau de soja",
      isRecurring: false,
    },
    {
      farmId,
      category: "VETERINARY" as const,
      amount: 75000,
      taxAmount: 0,
      totalAmount: 75000,
      date: new Date("2026-08-08"),
      paymentMethod: "mobile_money" as const,
      notes: "Vaccination / traitements (VB-09)",
      isRecurring: false,
    },
    {
      farmId,
      category: "LABOR" as const,
      amount: 250000,
      taxAmount: 0,
      totalAmount: 250000,
      date: new Date("2026-08-01"),
      paymentMethod: "cash" as const,
      notes: "Salaires ouvriers — août",
      isRecurring: true,
    },
    {
      farmId,
      category: "FUEL" as const,
      amount: 85000,
      taxAmount: 0,
      totalAmount: 85000,
      date: new Date("2026-08-12"),
      paymentMethod: "cash" as const,
      notes: "Gasoil groupe + tracteur",
      isRecurring: false,
    },
    {
      farmId,
      category: "MAINTENANCE" as const,
      amount: 120000,
      taxAmount: 0,
      totalAmount: 120000,
      date: new Date("2026-08-15"),
      paymentMethod: "mobile_money" as const,
      invoiceNumber: "FAC-MAINT-01",
      notes: "Réparation pompe à eau",
      isRecurring: false,
    },
    {
      farmId,
      category: "EQUIPMENT" as const,
      amount: 350000,
      taxAmount: 0,
      totalAmount: 350000,
      date: new Date("2026-07-20"),
      paymentMethod: "bank_transfer" as const,
      invoiceNumber: "FAC-EQUIP-01",
      notes: "Abreuvoirs automatiques",
      isRecurring: false,
    },
    {
      farmId,
      category: "TRANSPORT" as const,
      amount: 45000,
      taxAmount: 0,
      totalAmount: 45000,
      date: new Date("2026-08-18"),
      paymentMethod: "cash" as const,
      notes: "Transport animaux",
      isRecurring: false,
    },
    {
      farmId,
      category: "UTILITIES" as const,
      amount: 65000,
      taxAmount: 0,
      totalAmount: 65000,
      date: new Date("2026-08-05"),
      paymentMethod: "mobile_money" as const,
      notes: "Facture électricité",
      isRecurring: true,
    },
    {
      farmId,
      category: "SUPPLIES" as const,
      amount: 32000,
      taxAmount: 0,
      totalValue: undefined,
      totalAmount: 32000,
      date: new Date("2026-08-10"),
      paymentMethod: "cash" as const,
      notes: "Produits nettoyage / désinfection",
      isRecurring: false,
    },
  ];

  let expCount = 0;
  for (const e of expenses) {
    const { totalValue, ...data } = e as any; // sécurité si champ parasite
    await prisma.expense.create({ data });
    expCount++;
    console.log(`   ✅ ${data.category} — ${data.totalAmount.toLocaleString("fr-FR")} FCFA`);
  }
  console.log(`   → ${expCount} Expense créées\n`);

  console.log("🎉 Seed terminé !");
  console.log(`   FeedStock  : ${feedCount}/10`);
  console.log(`   Production : ${prodCount}/10`);
  console.log(`   Expense    : ${expCount}/10`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
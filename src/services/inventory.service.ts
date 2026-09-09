import prisma from "../models/prismaClient.js";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Diminue le stock d'un médicament et crée un mouvement de stock
 */
export async function decreaseMedicineStock(params: {
  inventoryId: number;
  quantityUsed: number;
  farmId: number;
  referenceType: "TREATMENT" | "VACCINATION";
  referenceId: number;
  userId?: number | null;
  notes?: string;
  tx?: any;
}) {
  const client = params.tx ?? prisma;
  const { inventoryId, quantityUsed, farmId, referenceType, referenceId, userId, notes } = params;

  // 1. Vérifier le stock disponible
  const item = await client.inventory.findUnique({
    where: { id: inventoryId },
  });

  if (!item) {
    throw new Error("Médicament introuvable dans l'inventaire");
  }

  if (item.category !== "MEDICINE") {
    throw new Error("Seuls les articles de catégorie MEDICINE peuvent être utilisés ici");
  }

  const currentQty = Number(item.quantity);
  if (currentQty < quantityUsed) {
    throw new Error(
      `Stock insuffisant. Disponible : ${currentQty} ${item.unit}, demandé : ${quantityUsed}`
    );
  }

  // 2. Décrémenter le stock
  const newQuantity = currentQty - quantityUsed;
  const updatedItem = await client.inventory.update({
    where: { id: inventoryId },
    data: {
      quantity: new Decimal(newQuantity),
      totalValue: item.unitPrice ? newQuantity * item.unitPrice : item.totalValue,
      status: item.minQuantity && newQuantity <= Number(item.minQuantity)
        ? "LOW_STOCK"
        : item.status,
    },
  });

  // 3. Créer un mouvement de stock (traçabilité)
  await client.stockMovement.create({
    data: {
      inventoryId,
      farmId,
      type: "USAGE",
      quantity: new Decimal(quantityUsed),
      previousQuantity: new Decimal(currentQty),
      newQuantity: new Decimal(newQuantity),
      reference: referenceType,
      referenceId,
      userId: userId ?? null,
      notes: notes ?? null,
      date: new Date(),
    },
  });

  return updatedItem;
}


/**
 * Augmente le stock d'un médicament et crée un mouvement de stock
 */
export async function increaseMedicineStock(params: {
  inventoryId: number;
  quantityUsed: number;
  farmId: number;
  referenceType: "TREATMENT" | "VACCINATION";
  referenceId: number;
  userId?: number | null;
  notes?: string;
  tx?: any;
}) {
  const { inventoryId, quantityUsed, farmId, referenceType, referenceId, userId, notes } = params;
  const client = params.tx ?? prisma;

  const item = await client.inventory.findUnique({
    where: { id: inventoryId },
  });

  if (!item) {
    throw new Error("Médicament introuvable dans l'inventaire");
  }

  if (item.category !== "MEDICINE") {
    throw new Error("Seuls les articles de catégorie MEDICINE peuvent être utilisés ici");
  }

  const currentQty = Number(item.quantity);
  const newQuantity = currentQty + quantityUsed;

  const updatedItem = await client.inventory.update({
    where: { id: inventoryId },
    data: {
      quantity: new Decimal(newQuantity),
      totalValue: item.unitPrice ? newQuantity * item.unitPrice : item.totalValue,
      status: item.minQuantity && newQuantity <= Number(item.minQuantity)
        ? "LOW_STOCK"
        : item.status,
    },
  });

  await client.stockMovement.create({
    data: {
      inventoryId,
      farmId,
      type: "RETURN", 
      quantity: new Decimal(quantityUsed),
      previousQuantity: new Decimal(currentQty),
      newQuantity: new Decimal(newQuantity),
      reference: `${referenceType}#${referenceId}`,
      userId: userId ?? null,
      notes: notes ?? null,
      date: new Date(),
    },
  });

  return updatedItem;
}
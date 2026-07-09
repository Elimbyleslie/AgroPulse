import prisma from "../models/prismaClient.js";
import { AlertStatus } from "../../generated/prisma/enums.js";

// ─── Seuil stock alimentaire critique (en kg/unité) ───────────────────────────
const FEED_STOCK_CRITICAL_THRESHOLD = 50;

async function alertAlreadyExists(
  farmId: number,
  title: string
): Promise<boolean> {
  const existing = await prisma.alert.findFirst({
    where: {
      farmId,
      title,
      status: AlertStatus.active,
    },
  });
  return !!existing;
}

async function createAlertIfNotExists(data: {
  farmId: number;
  title: string;
  message: string;
}): Promise<void> {
  const exists = await alertAlreadyExists(data.farmId, data.title);
  if (!exists) {
    await prisma.alert.create({
      data: {
        farmId:  data.farmId,
        title:   data.title,
        message: data.message,
        date:    new Date(),
        status:  AlertStatus.active,
      },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉCLENCHEUR 1 : Vaccin en retard
// Appelé automatiquement par le cron quotidien
// ─────────────────────────────────────────────────────────────────────────────
export async function checkOverdueVaccinations(): Promise<void> {
  const today = new Date();

  // Récupère tous les vaccins dont la date de rappel est dépassée
  const overdueVaccinations = await prisma.animalVaccination.findMany({
    where: {
      nextDue: { lt: today },
    },
    include: {
      animal: {
        include: {
          farm: true,
          species: true,
        },
      },
    },
  });

  for (const vaccination of overdueVaccinations) {
    if (!vaccination.animal?.farmId) continue;

    const animalName  = vaccination.animal.name;
    const speciesName = vaccination.animal.species?.name ?? "Animal";
    const vaccineName = vaccination.vaccineName ?? "Vaccin inconnu";
    const daysLate    = Math.floor(
      (today.getTime() - new Date(vaccination.nextDue!).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    await createAlertIfNotExists({
      farmId:  vaccination.animal.farmId,
      title:   `Vaccin en retard — ${animalName}`,
      message: `Le rappel du vaccin "${vaccineName}" pour ${speciesName} ${animalName} est en retard de ${daysLate} jour(s). Veuillez procéder à la vaccination dès que possible.`,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉCLENCHEUR 2 : Animal malade (à la création d'un AnimalHealthRecord)
// Appelé depuis le controller AnimalHealthRecord après création
// ─────────────────────────────────────────────────────────────────────────────
export async function triggerAlertForSickAnimal(healthRecordId: number): Promise<void> {
  const healthRecord = await prisma.animalHealthRecord.findUnique({
    where: { id: healthRecordId },
    include: {
      animal: {
        include: { species: true },
      },
    },
  });

  if (!healthRecord?.farmId || !healthRecord.animal) return;

  const animalName  = healthRecord.animal.name;
  const speciesName = healthRecord.animal.species?.name ?? "Animal";
  const symptoms    = healthRecord.symptoms ?? "Symptômes non précisés";
  const diagnosis   = healthRecord.diagnosis ?? "Diagnostic en cours";

  await createAlertIfNotExists({
    farmId:  healthRecord.farmId,
    title:   `Animal malade — ${animalName}`,
    message: `${speciesName} ${animalName} a été signalé(e) malade. Symptômes : ${symptoms}. Diagnostic : ${diagnosis}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉCLENCHEUR 3 : Mort d'un animal (à la création d'un AnimalDeath)
// Appelé depuis le controller AnimalDeath après création
// ─────────────────────────────────────────────────────────────────────────────
export async function triggerAlertForAnimalDeath(animalDeathId: number): Promise<void> {
  const animalDeath = await prisma.animalDeath.findUnique({
    where: { id: animalDeathId },
    include: {
      animal: {
        include: {
          farm:    true,
          species: true,
        },
      },
    },
  });

  if (!animalDeath?.animal?.farmId) return;

  const animalName  = animalDeath.animal.name;
  const speciesName = animalDeath.animal.species?.name ?? "Animal";
  const cause       = animalDeath.cause ?? "Cause inconnue";
  const dateOfDeath = animalDeath.dateOfDeath
    ? new Date(animalDeath.dateOfDeath).toLocaleDateString("fr-FR")
    : "Date inconnue";

  await createAlertIfNotExists({
    farmId:  animalDeath.animal.farmId,
    title:   `Décès — ${animalName}`,
    message: `${speciesName} ${animalName} est décédé(e) le ${dateOfDeath}. Cause : ${cause}.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉCLENCHEUR 4 : Stock alimentaire critique
// Appelé automatiquement par le cron quotidien
// ─────────────────────────────────────────────────────────────────────────────
export async function checkCriticalFeedStocks(): Promise<void> {
  const criticalStocks = await prisma.inventory.findMany({
    where: {
      quantity: { lte: FEED_STOCK_CRITICAL_THRESHOLD },
    },
    include: {
      farm: true,
    },
  });

  for (const stock of criticalStocks) {
    await createAlertIfNotExists({
      farmId:  stock.farmId,
      title:   `Stock critique — ${stock.name}`,
      message: `Le stock de "${stock.name}" est critique : ${stock.quantity} ${stock.unit} restants. Seuil d'alerte : ${FEED_STOCK_CRITICAL_THRESHOLD} ${stock.unit}. Veuillez réapprovisionner.`,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DÉCLENCHEUR 5 : Équipement hors service
// Appelé depuis le controller Equipment lors d'une mise à jour de statut
// ─────────────────────────────────────────────────────────────────────────────
export async function triggerAlertForEquipmentOutOfService(
  equipmentId: number
): Promise<void> {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
    include: { farm: true },
  });

  if (!equipment || equipment.status !== "outOfService") return;

  await createAlertIfNotExists({
    farmId:  equipment.farmId,
    title:   `Équipement hors service — ${equipment.name}`,
    message: `L'équipement "${equipment.name}" est signalé hors service. Une intervention de maintenance est requise.`,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CRON JOB — à appeler tous les jours à minuit
// Regroupe tous les checks automatiques périodiques
// ─────────────────────────────────────────────────────────────────────────────
export async function runDailyAlertChecks(): Promise<void> {
  console.log("[AlertService] Lancement des vérifications quotidiennes...");
  try {
    await checkOverdueVaccinations();
    console.log("[AlertService] ✅ Vaccins vérifiés");
    await checkCriticalFeedStocks();
    console.log("[AlertService] ✅ Stocks vérifiés");
  } catch (error) {
    console.error("[AlertService] ❌ Erreur lors des vérifications :", error);
  }
  console.log("[AlertService] Vérifications terminées.");
}
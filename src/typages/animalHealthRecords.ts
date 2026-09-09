

export enum HealthEventType {
  CONSULTATION = "CONSULTATION",
  VACCINATION = "VACCINATION",
  TREATMENT = "TREATMENT",
  GESTATION = "GESTATION",
  BIRTH = "BIRTH",
  ILLNESS = "ILLNESS",
  INJURY = "INJURY",
  DEATH = "DEATH",
  WEANING = "WEANING",
  OTHER = "OTHER",
}

interface CreateHealthRecordParams {
  tx: any; // Prisma transaction client
  eventType: HealthEventType;
  referenceType: string;
  referenceId: number;
  animalId?: number | null;
  lotId?: number | null;
  farmId?: number | null;
  eventDate?: Date | null;
  endDate?: Date | null;
  title?: string | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  treatmentSummary?: string | null;
  veterinarianId?: number | null;
  recordedById?: number | null;
  severity?: string | null;
  isClosed?: boolean;
}

export interface AnimalHealthRecord  {
  id: number;
  eventType: HealthEventType;
  referenceType: string;
  referenceId: number;
  animalId?: number | null;
  lotId?: number | null;
  farmId?: number | null;
  eventDate: Date;
  endDate?: Date | null;
  title?: string | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  treatmentSummary?: string | null;
  veterinarianId?: number | null;
  recordedById?: number | null;
  severity?: string | null;
  isClosed?: boolean;
}

/**
 * Crée un enregistrement d'historique de santé
 * à utiliser UNIQUEMENT à l'intérieur d'une transaction Prisma.
 */
export async function createHealthRecordFromSource(
  params: CreateHealthRecordParams,
) {
  const {
    tx,
    eventType,
    referenceType,
    referenceId,
    animalId = null,
    lotId = null,
    farmId = null,
    eventDate = new Date(),
    endDate = null,
    title = null,
    symptoms = null,
    diagnosis = null,
    notes = null,
    treatmentSummary = null,
    veterinarianId = null,
    recordedById = null,
    severity = null,
    isClosed = false,
  } = params;

  return tx.animalHealthRecord.create({
    data: {
      eventType,
      referenceType,
      referenceId,
      animalId,
      lotId,
      farmId,
      eventDate: eventDate ?? new Date(),
      endDate,
      title,
      symptoms,
      diagnosis,
      notes,
      treatmentSummary,
      veterinarianId,
      recordedById,
      severity,
      isClosed,
    },
  });
}
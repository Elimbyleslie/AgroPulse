import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalTreatment } from "../typages/animalTreatement.js";
import {
  decreaseMedicineStock,
  increaseMedicineStock,
} from "../services/inventory.service.js";
import {
  createHealthRecordFromSource,
  HealthEventType,
} from "../typages/animalHealthRecords.js";
// ======================================================
// CREATE
// ======================================================
export const createAnimalTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      animalId,
      lotId,
      treatmentName,
      medication,
      inventoryId,
      dosage,
      quantityUsed,
      startDate,
      endDate,
      administeredBy,
      farmId,
      treated = false,
      frequencyDays = 1,
    } = req.body;

    const isConfirmed = Boolean(treated);

    const treatment = await prisma.$transaction(async (tx) => {
      const created = await tx.animalTreatment.create({
        data: {
          animalId: animalId ? Number(animalId) : null,
          lotId: lotId ? Number(lotId) : null,
          treatmentName,
          medication,
          inventoryId: inventoryId ? Number(inventoryId) : null,
          dosage,
          quantityUsed: quantityUsed ? Number(quantityUsed) : null,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          administeredBy: administeredBy ? Number(administeredBy) : null,
          farmId: farmId ? Number(farmId) : null,
          treated: isConfirmed,
          frequencyDays: frequencyDays ? Number(frequencyDays) : 1,
          ...(isConfirmed ? { lastConfirmedAt: new Date() } : {}),
        },
        include: {
          animal: true,
          lot: true,
          inventory: true,
          admin: { select: { id: true, name: true } },
        },
      });

      // Historique de santé (toujours créé)
      await createHealthRecordFromSource({
        tx,
        eventType: HealthEventType.TREATMENT,
        referenceType: "TREATMENT",
        referenceId: created.id,
        animalId: created.animalId,
        lotId: created.lotId,
        farmId: created.farmId,
        eventDate: created.startDate,
        endDate: created.endDate,
        title: created.treatmentName || created.medication,
        treatmentSummary: created.dosage ? `Dosage : ${created.dosage}` : null,
        veterinarianId: created.administeredBy,
        recordedById: (req as any).user?.id ?? null,
        notes: isConfirmed
          ? `Traitement confirmé : ${created.treatmentName || created.medication || "N/A"}`
          : `Traitement programmé : ${created.treatmentName || created.medication || "N/A"}`,
        isClosed: isConfirmed,
      });

      // Stock uniquement si déjà confirmé à la création
      if (
        isConfirmed &&
        inventoryId &&
        quantityUsed &&
        Number(quantityUsed) > 0
      ) {
        await decreaseMedicineStock({
          inventoryId: Number(inventoryId),
          quantityUsed: Number(quantityUsed),
          farmId: Number(farmId),
          referenceType: "TREATMENT",
          referenceId: created.id,
          userId: administeredBy ? Number(administeredBy) : null,
          notes: `Traitement confirmé : ${treatmentName || medication || "N/A"}`,
          tx,
        });
      }

      return created;
    });

    return ResponseApi.success(res, "Traitement enregistré", 201, treatment);
  } catch (error: any) {
    if (
      error.message?.includes("Stock insuffisant") ||
      error.message?.includes("Médicament")
    ) {
      return ResponseApi.error(res, error.message, 400);
    }
    next(error);
  }
};

// ======================================================
// GET ALL + filtres + pagination
// ======================================================
export const getAllAnimalTreatments = async (
  req: Request<
    {},
    {},
    {},
    { animalId?: string; lotId?: string; page?: string; limit?: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { animalId, lotId } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (animalId) where.animalId = Number(animalId);
    if (lotId) where.lotId = Number(lotId);

    const treatments = await prisma.animalTreatment.findMany({
      skip: offset,
      take: limit,
      where: {
        animal: { farmId: req.user?.defaultFarmId },
      },
      orderBy: { startDate: "desc" },
      include: {
        animal: true,
        lot: true,
        admin: true, // nom de la relation du modèle
      },
    });

    const totalItems = await prisma.animalTreatment.count({ where });

    return ResponseApi.success(res, "Traitements récupérés", 200, {
      treatments,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ======================================================
// GET BY ID
// ======================================================
export const getAnimalTreatmentById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const treatment = await prisma.animalTreatment.findUnique({
      where: { id: Number(id) },
      include: {
        animal: true,
        lot: true,
        admin: true,
      },
    });

    if (!treatment) {
      return ResponseApi.error(res, "Traitement non trouvé", 404);
    }

    return ResponseApi.success(res, "Traitement récupéré", 200, treatment);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE
// ======================================================
export const updateAnimalTreatment = async (
  req: Request<{ id: string }, {}, Partial<AnimalTreatment>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const treatmentId = Number(id);

    const {
      animalId,
      lotId,
      treatmentName,
      medication,
      inventoryId,
      dosage,
      quantityUsed,
      startDate,
      endDate,
      administeredBy,
      farmId,
      treated,
      frequencyDays,
    } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.animalTreatment.findUnique({
        where: { id: treatmentId },
      });
      if (!existing) throw { code: "P2025" };

      const wasConfirmed = Boolean(existing.treated);
      const willBeConfirmed =
        treated !== undefined ? Boolean(treated) : wasConfirmed;

      // Nouvelle confirmation (première ou dose suivante)
      const isNewConfirmation =
        treated === true ||
        (wasConfirmed && treated === undefined && willBeConfirmed);

      const result = await tx.animalTreatment.update({
        where: { id: treatmentId },
        data: {
          ...(animalId !== undefined && {
            animalId: animalId ? Number(animalId) : null,
          }),
          ...(lotId !== undefined && {
            lotId: lotId ? Number(lotId) : null,
          }),
          ...(treatmentName !== undefined && { treatmentName }),
          ...(medication !== undefined && { medication }),
          ...(inventoryId !== undefined && {
            inventoryId: inventoryId ? Number(inventoryId) : null,
          }),
          ...(dosage !== undefined && { dosage }),
          ...(quantityUsed !== undefined && {
            quantityUsed: quantityUsed ? Number(quantityUsed) : null,
          }),
          ...(startDate !== undefined && {
            startDate: startDate ? new Date(startDate) : null,
          }),
          ...(endDate !== undefined && {
            endDate: endDate ? new Date(endDate) : null,
          }),
          ...(administeredBy !== undefined && {
            administeredBy: administeredBy ? Number(administeredBy) : null,
          }),
          ...(farmId !== undefined && {
            farmId: farmId ? Number(farmId) : null,
          }),
          ...(frequencyDays !== undefined && {
            frequencyDays: frequencyDays ? Number(frequencyDays) : 1,
          }),
          ...(treated !== undefined && { treated: willBeConfirmed }),
          // lastConfirmedAt géré côté serveur
          ...(isNewConfirmation && willBeConfirmed
            ? { lastConfirmedAt: new Date() }
            : {}),
        },
      });

      const finalFarmId = Number(result.farmId ?? existing.farmId);
      const oldInventoryId = existing.inventoryId;
      const oldQty = Number(existing.quantityUsed ?? 0);
      const newInventoryId = result.inventoryId;
      const newQty = Number(result.quantityUsed ?? 0);

      await tx.animalHealthRecord.updateMany({
        where: {
          referenceType: "TREATMENT",
          referenceId: result.id,
        },
        data: {
          notes: `Confirmé le ${new Date().toLocaleDateString("fr-FR")}`,
          isClosed: true,
        },
      });

      // ========== STOCK LOGIC ==========
      if (isNewConfirmation && willBeConfirmed) {
        // Chaque confirmation (y compris les doses suivantes) consomme du stock
        if (newInventoryId && newQty > 0) {
          await decreaseMedicineStock({
            inventoryId: newInventoryId,
            quantityUsed: newQty,
            farmId: finalFarmId,
            referenceType: "TREATMENT",
            referenceId: result.id,
            userId: result.administeredBy,
            notes: `Traitement confirmé : ${result.treatmentName || result.medication}`,
            tx,
          });
        }
      } else if (wasConfirmed && !willBeConfirmed) {
        // Un-confirm → restore stock
        if (oldInventoryId && oldQty > 0) {
          await increaseMedicineStock({
            inventoryId: oldInventoryId,
            quantityUsed: oldQty,
            farmId: Number(existing.farmId),
            referenceType: "TREATMENT",
            referenceId: existing.id,
            userId: existing.administeredBy,
            notes: `Traitement annulé : ${existing.treatmentName || existing.medication}`,
            tx,
          });
        }
      } else if (wasConfirmed && willBeConfirmed && !isNewConfirmation) {
        // Simple ajustement de quantité / inventaire
        if (
          oldInventoryId &&
          newInventoryId &&
          oldInventoryId === newInventoryId
        ) {
          const delta = newQty - oldQty;
          if (delta > 0) {
            await decreaseMedicineStock({
              inventoryId: newInventoryId,
              quantityUsed: delta,
              farmId: finalFarmId,
              referenceType: "TREATMENT",
              referenceId: result.id,
              userId: result.administeredBy,
              notes: `Ajustement traitement : ${result.treatmentName || result.medication}`,
              tx,
            });
          } else if (delta < 0) {
            await increaseMedicineStock({
              inventoryId: newInventoryId,
              quantityUsed: -delta,
              farmId: finalFarmId,
              referenceType: "TREATMENT",
              referenceId: result.id,
              userId: result.administeredBy,
              notes: `Ajustement traitement : ${result.treatmentName || result.medication}`,
              tx,
            });
          }
        } else {
          if (oldInventoryId && oldQty > 0) {
            await increaseMedicineStock({
              inventoryId: oldInventoryId,
              quantityUsed: oldQty,
              farmId: Number(existing.farmId),
              referenceType: "TREATMENT",
              referenceId: existing.id,
              userId: existing.administeredBy,
              notes: `Changement inventaire traitement : ${existing.treatmentName || existing.medication}`,
              tx,
            });
          }
          if (newInventoryId && newQty > 0) {
            await decreaseMedicineStock({
              inventoryId: newInventoryId,
              quantityUsed: newQty,
              farmId: finalFarmId,
              referenceType: "TREATMENT",
              referenceId: result.id,
              userId: result.administeredBy,
              notes: `Changement inventaire traitement : ${result.treatmentName || result.medication}`,
              tx,
            });
          }
        }
      }

      return result;
    });

    return ResponseApi.success(res, "Traitement mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Traitement non trouvé", 404);
    }
    if (
      error.message?.includes("Stock insuffisant") ||
      error.message?.includes("Médicament")
    ) {
      return ResponseApi.error(res, error.message, 400);
    }
    next(error);
  }
};

// ======================================================
// DELETE
// ======================================================
export const deleteAnimalTreatment = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const treatmentId = Number(id);

    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.animalTreatment.findUnique({
        where: { id: treatmentId },
      });

      if (!existing) {
        throw { code: "P2025" };
      }

      // Restore stock only if it was confirmed
      if (
        existing.treated &&
        existing.inventoryId &&
        existing.quantityUsed &&
        Number(existing.quantityUsed) > 0
      ) {
        await increaseMedicineStock({
          inventoryId: existing.inventoryId,
          quantityUsed: Number(existing.quantityUsed),
          farmId: Number(existing.farmId),
          referenceType: "TREATMENT",
          referenceId: existing.id,
          userId: existing.administeredBy,
          notes: `Suppression traitement confirmé : ${existing.treatmentName || existing.medication || "N/A"}`,
          tx,
        });
      }

      return tx.animalTreatment.delete({
        where: { id: treatmentId },
      });
    });

    return ResponseApi.success(res, "Traitement supprimé", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Traitement non trouvé", 404);
    }
    next(error);
  }
};

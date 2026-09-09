import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { AnimalVaccination } from "../typages/animalVaccination.js";
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
export const createAnimalVaccination = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      animalId,
      lotId,
      vaccineName,
      dateGiven,
      nextDue,
      administeredBy,
      inventoryId,
      quantityUsed,
      farmId,
      vaccinated = false,
    } = req.body;

    const isConfirmed = Boolean(vaccinated);

    const vaccination = await prisma.$transaction(async (tx) => {
      const created = await tx.animalVaccination.create({
        data: {
          animalId: animalId ? Number(animalId) : null,
          lotId: lotId ? Number(lotId) : null,
          vaccineName,
          inventoryId: inventoryId ? Number(inventoryId) : null,
          quantityUsed: quantityUsed ? Number(quantityUsed) : null,
          dateGiven: dateGiven ? new Date(dateGiven) : null,
          nextDue: nextDue ? new Date(nextDue) : null,
          administeredBy: administeredBy ? Number(administeredBy) : null,
          farmId: farmId ? Number(farmId) : null,
          vaccinated: isConfirmed,
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
        eventType: HealthEventType.VACCINATION,
        referenceType: "VACCINATION",
        referenceId: created.id,
        animalId: created.animalId,
        lotId: created.lotId,
        farmId: created.farmId,
        eventDate: created.dateGiven,
        endDate: created.nextDue,
        title: created.vaccineName,
        treatmentSummary: null,
        veterinarianId: created.administeredBy,
        recordedById: (req as any).user?.id ?? null,
        notes: isConfirmed
          ? `Vaccination confirmée : ${created.vaccineName || "N/A"}`
          : `Vaccination programmée : ${created.vaccineName || "N/A"}`,
        isClosed: isConfirmed,
      });


      // Stock is consumed ONLY when confirmed
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
          referenceType: "VACCINATION",
          referenceId: created.id,
          userId: administeredBy ? Number(administeredBy) : null,
          notes: `Vaccin confirmé : ${vaccineName || "N/A"}`,
          tx,
        });
      }

      return created;
    });

    return ResponseApi.success(res, "Vaccination créée", 201, vaccination);
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
export const getAllAnimalVaccinations = async (
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

    const vaccinations = await prisma.animalVaccination.findMany({
      skip: offset,
      take: limit,
      where: {
        animal: { farmId: req.user?.defaultFarmId },
      },
      orderBy: { dateGiven: "desc" },
      include: {
        animal: true,
        lot: true,
        admin: true,
      },
    });

    const totalItems = await prisma.animalVaccination.count({ where });

    return ResponseApi.success(res, "Liste des vaccinations", 200, {
      vaccinations,
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
export const getAnimalVaccinationById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return ResponseApi.error(res, "ID invalide", 400);
    }

    const vaccination = await prisma.animalVaccination.findUnique({
      where: { id: Number(id) },
      include: {
        animal: true,
        lot: true,
        admin: true,
      },
    });

    if (!vaccination) {
      return ResponseApi.error(res, "Vaccination non trouvée", 404);
    }

    return ResponseApi.success(res, "Vaccination récupérée", 200, vaccination);
  } catch (error) {
    next(error);
  }
};

// ======================================================
// UPDATE
// ======================================================
export const updateAnimalVaccination = async (
  req: Request<{ id: string }, {}, Partial<AnimalVaccination>>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const vaccinationId = Number(id);

    const {
      animalId,
      lotId,
      vaccineName,
      dateGiven,
      nextDue,
      administeredBy,
      inventoryId,
      quantityUsed,
      farmId,
      vaccinated,
    } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.animalVaccination.findUnique({
        where: { id: vaccinationId },
      });
      if (!existing) throw { code: "P2025" };

      const wasConfirmed = Boolean(existing.vaccinated);
      const willBeConfirmed =
        vaccinated !== undefined ? Boolean(vaccinated) : wasConfirmed;

      // On considère qu'il y a une nouvelle confirmation si on passe à true
      // ou si on est déjà confirmé et qu'on renvoie vaccinated: true
      const isNewConfirmation =
        vaccinated === true || (wasConfirmed && vaccinated === undefined && willBeConfirmed);

      const result = await tx.animalVaccination.update({
        where: { id: vaccinationId },
        data: {
          ...(animalId !== undefined && {
            animalId: animalId ? Number(animalId) : null,
          }),
          ...(lotId !== undefined && {
            lotId: lotId ? Number(lotId) : null,
          }),
          ...(vaccineName !== undefined && { vaccineName }),
          ...(dateGiven !== undefined && {
            dateGiven: dateGiven ? new Date(dateGiven) : null,
          }),
          ...(nextDue !== undefined && {
            nextDue: nextDue ? new Date(nextDue) : null,
          }),
          ...(administeredBy !== undefined && {
            administeredBy: administeredBy ? Number(administeredBy) : null,
          }),
          ...(inventoryId !== undefined && {
            inventoryId: inventoryId ? Number(inventoryId) : null,
          }),
          ...(quantityUsed !== undefined && {
            quantityUsed: quantityUsed ? Number(quantityUsed) : null,
          }),
          ...(farmId !== undefined && {
            farmId: farmId ? Number(farmId) : null,
          }),
          ...(vaccinated !== undefined && { vaccinated: willBeConfirmed }),
          // lastConfirmedAt est géré côté serveur uniquement
          ...(isNewConfirmation && willBeConfirmed
            ? { lastConfirmedAt: new Date() }
            : {}),
        },
      });

      // Historique de santé (toujours créé)
      await tx.animalHealthRecord.updateMany({
        where: {
          referenceType: "VACCINATION",
          referenceId: result.id,
        },
        data: {
          notes: `Confirmé le ${new Date().toLocaleDateString("fr-FR")}`,
          isClosed: true,
        },
      });

      const finalFarmId = Number(result.farmId ?? existing.farmId);
      const oldInventoryId = existing.inventoryId;
      const oldQty = Number(existing.quantityUsed ?? 0);
      const newInventoryId = result.inventoryId;
      const newQty = Number(result.quantityUsed ?? 0);

      // ========== STOCK LOGIC ==========
      if (isNewConfirmation && willBeConfirmed) {
        // Chaque confirmation consomme du stock
        if (newInventoryId && newQty > 0) {
          await decreaseMedicineStock({
            inventoryId: newInventoryId,
            quantityUsed: newQty,
            farmId: finalFarmId,
            referenceType: "VACCINATION",
            referenceId: result.id,
            userId: result.administeredBy,
            notes: `Vaccin confirmé : ${result.vaccineName}`,
            tx,
          });
        }
      } else if (wasConfirmed && !willBeConfirmed) {
        // Un-confirm → restore stock (une seule fois)
        if (oldInventoryId && oldQty > 0) {
          await increaseMedicineStock({
            inventoryId: oldInventoryId,
            quantityUsed: oldQty,
            farmId: Number(existing.farmId),
            referenceType: "VACCINATION",
            referenceId: existing.id,
            userId: existing.administeredBy,
            notes: `Vaccin annulé : ${existing.vaccineName}`,
            tx,
          });
        }
      } else if (wasConfirmed && willBeConfirmed && !isNewConfirmation) {
        // Simple mise à jour de quantité / inventaire (sans nouvelle confirmation)
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
              referenceType: "VACCINATION",
              referenceId: result.id,
              userId: result.administeredBy,
              notes: `Ajustement vaccin : ${result.vaccineName}`,
              tx,
            });
          } else if (delta < 0) {
            await increaseMedicineStock({
              inventoryId: newInventoryId,
              quantityUsed: -delta,
              farmId: finalFarmId,
              referenceType: "VACCINATION",
              referenceId: result.id,
              userId: result.administeredBy,
              notes: `Ajustement vaccin : ${result.vaccineName}`,
              tx,
            });
          }
        } else {
          if (oldInventoryId && oldQty > 0) {
            await increaseMedicineStock({
              inventoryId: oldInventoryId,
              quantityUsed: oldQty,
              farmId: Number(existing.farmId),
              referenceType: "VACCINATION",
              referenceId: existing.id,
              userId: existing.administeredBy,
              notes: `Changement inventaire vaccin : ${existing.vaccineName}`,
              tx,
            });
          }
          if (newInventoryId && newQty > 0) {
            await decreaseMedicineStock({
              inventoryId: newInventoryId,
              quantityUsed: newQty,
              farmId: finalFarmId,
              referenceType: "VACCINATION",
              referenceId: result.id,
              userId: result.administeredBy,
              notes: `Changement inventaire vaccin : ${result.vaccineName}`,
              tx,
            });
          }
        }
      }

      return result;
    });

    return ResponseApi.success(res, "Vaccination mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Vaccination non trouvée", 404);
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
export const deleteAnimalVaccination = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const vaccinationId = Number(id);

    const deleted = await prisma.$transaction(async (tx) => {
      const existing = await tx.animalVaccination.findUnique({
        where: { id: vaccinationId },
      });

      if (!existing) {
        throw { code: "P2025" };
      }

      // Restore stock only if it was confirmed
      if (
        existing.vaccinated &&
        existing.inventoryId &&
        existing.quantityUsed &&
        Number(existing.quantityUsed) > 0
      ) {
        await increaseMedicineStock({
          inventoryId: existing.inventoryId,
          quantityUsed: Number(existing.quantityUsed),
          farmId: Number(existing.farmId),
          referenceType: "VACCINATION",
          referenceId: existing.id,
          userId: existing.administeredBy,
          notes: `Suppression vaccin confirmé : ${existing.vaccineName || "N/A"}`,
          tx,
        });
      }

      return tx.animalVaccination.delete({
        where: { id: vaccinationId },
      });
    });

    return ResponseApi.success(res, "Vaccination supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Vaccination non trouvée", 404);
    }
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Settings } from "../typages/settings.js";

// ========================
// GET SETTINGS (par Farm ou Organization)
// ========================
export const getSettings = async (
  req: Request<{}, {}, {}, { farmId?: string; organizationId?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { farmId, organizationId } = req.query;

    const settings = await prisma.settings.findFirst({
      where: {
        ...(farmId && { farmId: Number(farmId) }),
        ...(organizationId && { organizationId: Number(organizationId) }),
      },
      include: {
        farm: true,
        organization: true,
      },
    });

    if (!settings) {
      // Retourner des valeurs par défaut si aucun paramètre n'existe
      return ResponseApi.success(res, "Paramètres par défaut retournés", 200, {
        currency: "XOF",
        language: "fr",
        dateFormat: "DD/MM/YYYY",
        timezone: "Africa/Dakar",
        weightUnit: "kg",
        volumeUnit: "L",
        areaUnit: "ha",
        heatDetectionDays: 21,
        gestationDuration: 280,
        enableEmailAlerts: true,
        enableSmsAlerts: false,
        lowStockThreshold: 10,
        taxRate: 0,
        defaultPaymentMethod: "cash",
        primaryColor: "#1e40af",
      });
    }

    return ResponseApi.success(res, "Paramètres récupérés avec succès", 200, settings);
  } catch (error) {
    next(error);
  }
};

// ========================
// CREATE OR UPDATE SETTINGS (Upsert)
// ========================
export const upsertSettings = async (
  req: Request<{}, {}, Settings>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      farmId,
      organizationId,
      currency,
      language,
      dateFormat,
      timezone,
      weightUnit,
      volumeUnit,
      areaUnit,
      defaultSpeciesId,
      defaultBreedId,
      heatDetectionDays,
      gestationDuration,
      enableEmailAlerts,
      enableSmsAlerts,
      lowStockThreshold,
      taxRate,
      defaultPaymentMethod,
      primaryColor,
      logoUrl,
      farmName,
    } = req.body;

    const settings = await prisma.settings.upsert({
      where: {
        farmId: farmId ? Number(farmId) : undefined,
      },
      update: {
        currency,
        language,
        dateFormat,
        timezone,
        weightUnit,
        volumeUnit,
        areaUnit,
        defaultSpeciesId,
        defaultBreedId,
        heatDetectionDays,
        gestationDuration,
        enableEmailAlerts,
        enableSmsAlerts,
        lowStockThreshold,
        taxRate,
        defaultPaymentMethod,
        primaryColor,
        logoUrl,
        farmName,
      },
      create: {
        farmId: farmId ? Number(farmId) : undefined,
        organizationId: organizationId ? Number(organizationId) : undefined,
        currency: currency || "XOF",
        language: language || "fr",
        dateFormat: dateFormat || "DD/MM/YYYY",
        timezone: timezone || "Africa/Dakar",
        weightUnit: weightUnit || "kg",
        volumeUnit: volumeUnit || "L",
        areaUnit: areaUnit || "ha",
        heatDetectionDays: heatDetectionDays || 21,
        gestationDuration: gestationDuration || 280,
        enableEmailAlerts: enableEmailAlerts ?? true,
        enableSmsAlerts: enableSmsAlerts ?? false,
        lowStockThreshold: lowStockThreshold || 10,
        taxRate: taxRate || 0,
        defaultPaymentMethod: defaultPaymentMethod ,
        primaryColor: primaryColor || "#1e40af",
        logoUrl,
        farmName,
      },
    });

    return ResponseApi.success(res, "Paramètres enregistrés avec succès", 200, settings);
  } catch (error) {
    next(error);
  }
};

// ========================
// UPDATE SETTINGS
// ========================
export const updateSettings = async (
  req: Request<{ id: string }, {}, Partial<Settings>>,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await prisma.settings.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });

    return ResponseApi.success(res, "Paramètres mis à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return ResponseApi.error(res, "Paramètres non trouvés", 404);
    }
    next(error);
  }
};

export default {
  getSettings,
  upsertSettings,
  updateSettings,
};

export const deleteSettings = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
    try {
      const deleted = await prisma.settings.delete({
        where: { id: Number(req.params.id) },
      });
  
      return ResponseApi.success(res, "Paramètres supprimés", 200, deleted);
    } catch (error: any) {
      if (error.code === "P2025") {
        return ResponseApi.error(res, "Paramètres non trouvés", 404);
      }
      next(error);
    }
}; 
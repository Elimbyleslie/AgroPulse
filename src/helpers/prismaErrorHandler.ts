import { Prisma } from "@prisma/client";
import { Response } from "express";

/**
 * Gère proprement les erreurs Prisma et renvoie une réponse JSON uniforme.
 */
export const handlePrismaError = (error: any, res: Response) => {
  console.error("❌ Prisma Error:", error);

  // Erreurs de validation Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: "Erreur de validation des données. Vérifie les champs envoyés.",
      details: error.message,
    });
  }

  // Erreurs d’intégrité (ex : violation de contrainte unique)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return res.status(409).json({
          success: false,
          message: "Un enregistrement similaire existe déjà (clé unique violée).",
          meta: error.meta,
        });
      case "P2003":
        return res.status(400).json({
          success: false,
          message: "Impossible d'exécuter l'action : contrainte de clé étrangère violée.",
          meta: error.meta,
        });
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "L'enregistrement demandé est introuvable.",
          meta: error.meta,
        });
      default:
        return res.status(500).json({
          success: false,
          message: "Erreur Prisma inconnue.",
          code: error.code,
          meta: error.meta,
        });
    }
  }

  // Erreurs de connexion ou autre erreur interne
  return res.status(500).json({
    success: false,
    message: "Erreur interne du serveur.",
    details: error.message || "Erreur inconnue.",
  });
};
export default handlePrismaError;
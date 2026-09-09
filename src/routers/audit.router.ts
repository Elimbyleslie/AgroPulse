import { Router } from "express";
import {
  getAllAudits,
  getAuditById,
  searchAudits,
  getAuditStats,
  getRecentActivities,
  exportAudits,
} from "../controllers/audit.controller.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();



router.get(
  "/",
  authenticate,
  authorizePermission([Permission.READ_AUDIT]),
  getAllAudits
);

// Recherche
router.get(
  "/search",
  authenticate,
  authorizePermission([Permission.READ_AUDIT]),
  searchAudits
);

// Statistiques
router.get(
  "/stats",
  authenticate,
  authorizePermission([Permission.READ_AUDIT]),
  getAuditStats
);

// Activités récentes
router.get(
  "/recent",
  authenticate,
  authorizePermission([Permission.READ_AUDIT]),
  getRecentActivities
);

// Export (JSON ou CSV)
router.get(
  "/export",
  authenticate,
  authorizePermission([Permission.READ_AUDIT]),
  exportAudits
);

// Récupérer un audit par ID
router.get(
  "/:id",
  authenticate,
  authorizePermission([Permission.READ_AUDIT]),
  getAuditById
);

export default router;

import express from 'express';
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStats,
  searchAuditLogs,
  exportAuditLogs,
  getRecentActivities
} from '../controllers/audit.controller.js';


const router = express.Router();

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/stats', getAuditStats);
router.get('/recent', getRecentActivities);
// Routes avec restrictions (admin seulement pour certains endpoints)
router.get('/auditlogs', getAllAuditLogs);
router.get('/search',  searchAuditLogs);
router.get('/export',  exportAuditLogs);
router.get('/:id',  getAuditLogById);

export default router;
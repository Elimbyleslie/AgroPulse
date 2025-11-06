
import express from 'express';
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStats,
  searchAuditLogs,
  exportAuditLogs,
  getRecentActivities
} from '../controllers/audit.controller';
import { requireAuth, requireRole } from '../middlewares/auth';

const router = express.Router();

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/recent', requireAuth, getRecentActivities);
router.get('/stats', requireAuth, getAuditStats);

// Routes avec restrictions (admin seulement pour certains endpoints)
router.get('/', requireAuth, getAllAuditLogs);
router.get('/search', requireAuth, searchAuditLogs);
router.get('/export', requireAuth, exportAuditLogs);
router.get('/:id', requireAuth, getAuditLogById);

export default router;
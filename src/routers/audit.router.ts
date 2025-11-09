
import express from 'express';
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStats,
  searchAuditLogs,
  exportAuditLogs,
  getRecentActivities
} from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Routes accessibles à tous les utilisateurs authentifiés

router.get('/stats', authenticate, getAuditStats);
router.get('/recent', authenticate, getRecentActivities);
// Routes avec restrictions (admin seulement pour certains endpoints)
router.get('/auditlogs', authenticate,authorize(['admin', 'manager']), getAllAuditLogs);
router.get('/search', authenticate, authorize(['admin', 'manager']), searchAuditLogs);
router.get('/export', authenticate, authorize(['admin', 'manager']), exportAuditLogs);
router.get('/:id', authenticate, authorize(['admin', 'manager']), getAuditLogById);

export default router;
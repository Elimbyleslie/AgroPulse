
import express from 'express';
import {
  getAllAuditLogs,
  getAuditLogById,
  getAuditStats,
  searchAuditLogs,
  exportAuditLogs,
  getRecentActivities
} from '../controllers/audit.controller.js';
import { authenticate, authorizePermission } from '../middlewares/auth.js';
import { Permission } from '../helpers/permissions.js';

const router = express.Router();

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/stats', authenticate, authorizePermission([Permission.READ_AUDIT]), getAuditStats);
router.get('/recent', authenticate, authorizePermission([Permission.READ_AUDIT]), getRecentActivities);
// Routes avec restrictions (admin seulement pour certains endpoints)
router.get('/auditlogs', authenticate, authorizePermission([Permission.READ_AUDIT]), getAllAuditLogs);
router.get('/search', authenticate, authorizePermission([Permission.READ_AUDIT]), searchAuditLogs);
router.get('/export', authenticate, authorizePermission([Permission.READ_AUDIT]), exportAuditLogs);
router.get('/:id', authenticate, authorizePermission([Permission.READ_AUDIT]), getAuditLogById);

export default router;
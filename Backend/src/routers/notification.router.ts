
import express from 'express';
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createBulkNotifications,
  getAllNotificationsAdmin
} from '../controllers/notification.controller';
import { requireAuth, requireRole } from '../middleware/auth';

const router = express.Router();

// Routes publiques (nécessitent une authentification)
router.get('/', requireAuth, getAllNotifications);
router.get('/stats', requireAuth, getNotificationStats);
router.get('/:id', requireAuth, getNotificationById);
router.put('/:id/read', requireAuth, markAsRead);
router.put('/read-all', requireAuth, markAllAsRead);
router.delete('/:id', requireAuth, deleteNotification);

// Routes admin
router.get('/admin/all', requireAuth, requireRole(['ADMIN']), getAllNotificationsAdmin);
router.post('/admin/bulk', requireAuth, requireRole(['ADMIN']), createBulkNotifications);
router.post('/', requireAuth, requireRole(['ADMIN']), createNotification);

export default router;
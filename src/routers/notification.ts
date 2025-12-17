import { Router } from "express";
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markNotificationAsRead,
  markNotificationAsUnread,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";

import {
  createNotificationSchema,
  updateNotificationSchema,
} from "../validations/notification.js";

import { validator } from "../middlewares/validator.middleware.js";
import { authenticate, authorizePermission } from "../middlewares/auth.js";
import { Permission } from "../helpers/permissions.js";

const router = Router();

router.get("/", getAllNotifications);
router.get("/:id", authenticate, authorizePermission([Permission.READ_NOTIFICATION]), getNotificationById);
router.get("/:userId/unread-count", authenticate, authorizePermission([Permission.READ_NOTIFICATION]), getUnreadCount);
router.post("/", authenticate, authorizePermission([Permission.CREATE_NOTIFICATION]), validator(createNotificationSchema), createNotification);
router.put("/:id", authenticate, authorizePermission([Permission.UPDATE_NOTIFICATION]), validator(updateNotificationSchema), updateNotification);
router.delete("/:id", authenticate, authorizePermission([Permission.DELETE_NOTIFICATION]), deleteNotification);
router.patch("/:id/read", authenticate, authorizePermission([Permission.UPDATE_NOTIFICATION]), markNotificationAsRead);
router.patch("/:id/unread", authenticate, authorizePermission([Permission.UPDATE_NOTIFICATION]), markNotificationAsUnread);

router.patch("/user/:userId/read-all", authenticate, authorizePermission([Permission.UPDATE_NOTIFICATION]), markAllAsRead);

export default router;

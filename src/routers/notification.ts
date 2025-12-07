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

const router = Router();

router.get("/", getAllNotifications);
router.get("/:id", getNotificationById);
router.get("/:userId/unread-count", getUnreadCount);

router.post("/", validator(createNotificationSchema), createNotification);
router.put("/:id", validator(updateNotificationSchema), updateNotification);

router.delete("/:id", deleteNotification);

router.patch("/:id/read", markNotificationAsRead);
router.patch("/:id/unread", markNotificationAsUnread);

router.patch("/user/:userId/read-all", markAllAsRead);

export default router;

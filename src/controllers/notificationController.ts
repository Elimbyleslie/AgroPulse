import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

/**
 * CREATE
 */
export const createNotification = async (
  req: Request<{}, {}, { userId: number; title: string; message: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, title, message } = req.body;

    const notification = await prisma.notification.create({
      data: { userId, title, message },
    });

    return ResponseApi.success(res, "Notification créée", 201, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * GET ALL
 */
export const getAllNotifications = async (
  req: Request<{}, {}, {}, { userId?: string; read?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, read } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const where: any = {};
    if (userId) where.userId = Number(userId);
    if (read !== undefined) where.read = read === "true";

    const notifications = await prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    const totalItems = await prisma.notification.count({ where });

    return ResponseApi.success(res, "Notifications récupérées", 200, {
      notifications,
      pagination: {
        currentPage: page,
        nextPage: page * limit < totalItems ? page + 1 : null,
        previousPage: page > 1 ? page - 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BY ID
 */
export const getNotificationById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!notification) {
      return ResponseApi.error(res, "Notification introuvable", 404);
    }

    return ResponseApi.success(res, "Notification récupérée", 200, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE
 */
export const updateNotification = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.update({
      where: { id },
      data: req.body,
    });

    return ResponseApi.success(res, "Notification mise à jour", 200, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE
 */
export const deleteNotification = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    await prisma.notification.delete({ where: { id } });

    return ResponseApi.success(res, "Notification supprimée", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * MARK AS READ
 */
export const markNotificationAsRead = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return ResponseApi.success(res, "Notification marquée comme lue", 200, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * MARK AS UNREAD
 */
export const markNotificationAsUnread = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: false },
    });

    return ResponseApi.success(res, "Notification marquée comme non lue", 200, notification);
  } catch (error) {
    next(error);
  }
};

/**
 * MARK ALL AS READ (FOR USER)
 */
export const markAllAsRead = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params.userId);

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return ResponseApi.success(res, "Toutes les notifications ont été marquées comme lues", 200);
  } catch (error) {
    next(error);
  }
};

/**
 * GET UNREAD COUNT (FOR USER)
 */
export const getUnreadCount = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Number(req.params.userId);

    const unread = await prisma.notification.count({
      where: { userId, read: false },
    });

    return ResponseApi.success(res, "Nombre de notifications non lues", 200, { unread });
  } catch (error) {
    next(error);
  }
};

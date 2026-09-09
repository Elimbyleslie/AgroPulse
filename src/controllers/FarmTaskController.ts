import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";

// CREATE
export const createFarmTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await prisma.farmTask.create({
      data: {
        ...req.body,
        createdBy: (req as any).user?.id, 
      },
      include: { farm: true, assignedUser: true, creator: true  },
    });

    // 🔔 Notifier l'utilisateur assigné, si présent, en liant la notification à la tâche
    if (task.assignedTo) {
      await prisma.notification.create({
        data: {
          userId: task.assignedTo,
          title: "Nouvelle tâche attribuée",
          message: `On vous a attribué la tâche "${task.title}"${
            task.farm ? ` sur la ferme ${task.farm.name}` : ""
          }.`,
          farmTaskId: task.id,
        },
      });
    }

    return ResponseApi.success(res, "Tâche créée", 201, task);
  } catch (error) {
    next(error);
  }
};

// GET ALL
export const getAllFarmTasks = async (
  req: Request<
    {},
    {},
    {},
    { farmId?: string; status?: string; page?: string; limit?: string, assignedTo: string }
  >,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, status, assignedTo } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (farmId) where.farmId = Number(farmId);
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = Number(assignedTo);

    const tasks = await prisma.farmTask.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dueDate: "asc" },
      include: { farm: true, assignedUser: true },
    });
    const totalItems = await prisma.farmTask.count({ where });

    return ResponseApi.success(res, "Liste des tâches récupérée", 200, {
      tasks,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET BY ID
export const getFarmTaskById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const task = await prisma.farmTask.findUnique({
      where: { id: Number(req.params.id) },
      include: { farm: true, assignedUser: true },
    });
    if (!task) return ResponseApi.error(res, "Tâche non trouvée", 404);
    return ResponseApi.success(res, "Tâche récupérée", 200, task);
  } catch (error) {
    next(error);
  }
};

// UPDATE
export const updateFarmTask = async (
  req: Request<{ id: string }, {}, any>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const taskId = Number(req.params.id);

    // On récupère l'état AVANT modification pour détecter une réattribution
    const existing = await prisma.farmTask.findUnique({ where: { id: taskId } });
    if (!existing) return ResponseApi.error(res, "Tâche non trouvée", 404);

    const updated = await prisma.farmTask.update({
      where: { id: taskId },
      data: req.body,
      include: { farm: true, assignedUser: true },
    });

    const currentUserId = (req as any).user?.id;

    // 🔔 Notifier uniquement si l'assignation a réellement changé (nouvel utilisateur assigné)
    const reassigned =
      "assignedTo" in req.body &&
      updated.assignedTo &&
      updated.assignedTo !== existing.assignedTo;

    if (reassigned) {
      await prisma.notification.create({
        data: {
          userId: updated.assignedTo!,
          title: "Tâche attribuée",
          message: `On vous a attribué la tâche "${updated.title}"${
            updated.farm ? ` sur la ferme ${updated.farm.name}` : ""
          }.`,
          farmTaskId: updated.id,
        },
      });
    }

    // 🔔 Notifier le créateur si le statut a changé (et que ce n'est pas lui qui vient de le changer)
    const statusChanged =
      "status" in req.body && updated.status !== existing.status;

    if (
      statusChanged &&
      existing.createdBy &&
      existing.createdBy !== currentUserId
    ) {
      await prisma.notification.create({
        data: {
          userId: existing.createdBy,
          title: "Statut de tâche mis à jour",
          message: `La tâche "${updated.title}" est passée au statut "${updated.status}".`,
          farmTaskId: updated.id,
        },
      });
    }

    return ResponseApi.success(res, "Tâche mise à jour", 200, updated);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Tâche non trouvée", 404);
    next(error);
  }
};

// DELETE
export const deleteFarmTask = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Les notifications liées sont supprimées automatiquement via onDelete: Cascade
    // (à condition que la relation Notification.farmTask soit bien configurée ainsi dans le schéma)
    const deleted = await prisma.farmTask.delete({
      where: { id: Number(req.params.id) },
    });
    return ResponseApi.success(res, "Tâche supprimée", 200, deleted);
  } catch (error: any) {
    if (error.code === "P2025")
      return ResponseApi.error(res, "Tâche non trouvée", 404);
    next(error);
  }
};
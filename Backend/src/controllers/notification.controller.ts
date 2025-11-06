
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const { statut, type_notif, page = 1, limit = 20 } = req.query;

    const where: any = { utilisateur_id: userId };

    if (statut) where.statut = statut;
    if (type_notif) where.type_notif = type_notif;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        select: {
          id_notification: true,
          titre: true,
          message: true,
          type_notif: true,
          statut: true,
          date_creation: true,
          date_lu: true
        },
        orderBy: { date_creation: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.notifications.count({ where })
    ]);

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;
    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const notification = await prisma.notifications.findFirst({
      where: {
        id_notification: notificationId,
        utilisateur_id: userId
      },
      select: {
        id_notification: true,
        titre: true,
        message: true,
        type_notif: true,
        statut: true,
        date_creation: true,
        date_lu: true,
        utilisateur: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Erreur lors de la récupération de la notification:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { utilisateur_id, titre, message, type_notif = 'application' } = req.body;

    // Validation des champs requis
    if (!utilisateur_id) {
      return res.status(400).json({ error: 'Le champ "utilisateur_id" est requis' });
    }
    if (!titre) {
      return res.status(400).json({ error: 'Le champ "titre" est requis' });
    }
    if (!message) {
      return res.status(400).json({ error: 'Le champ "message" est requis' });
    }

    // Vérifier que l'utilisateur existe
    const userExists = await prisma.utilisateurs.findUnique({
      where: { id_user: utilisateur_id }
    });

    if (!userExists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const newNotification = await prisma.notifications.create({
      data: {
        utilisateur_id,
        titre,
        message,
        type_notif,
        statut: 'non_lu'
      },
      select: {
        id_notification: true,
        titre: true,
        message: true,
        type_notif: true,
        statut: true,
        date_creation: true,
        utilisateur: {
          select: {
            id_user: true,
            nom: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(newNotification);
  } catch (error: any) {
    console.error('Erreur lors de la création de la notification:', error);
    
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Utilisateur invalide' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;
    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const notification = await prisma.notifications.findFirst({
      where: {
        id_notification: notificationId,
        utilisateur_id: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    const updatedNotification = await prisma.notifications.update({
      where: { id_notification: notificationId },
      data: {
        statut: 'lu',
        date_lu: new Date()
      },
      select: {
        id_notification: true,
        titre: true,
        message: true,
        type_notif: true,
        statut: true,
        date_creation: true,
        date_lu: true
      }
    });

    res.json(updatedNotification);
  } catch (error: any) {
    console.error('Erreur lors du marquage comme lu:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const result = await prisma.notifications.updateMany({
      where: {
        utilisateur_id: userId,
        statut: 'non_lu'
      },
      data: {
        statut: 'lu',
        date_lu: new Date()
      }
    });

    res.json({
      message: `${result.count} notification(s) marquée(s) comme lue(s)`,
      count: result.count
    });
  } catch (error) {
    console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;
    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const notification = await prisma.notifications.findFirst({
      where: {
        id_notification: notificationId,
        utilisateur_id: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }

    await prisma.notifications.delete({
      where: { id_notification: notificationId }
    });

    res.status(204).send();
  } catch (error: any) {
    console.error('Erreur lors de la suppression de la notification:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const stats = await prisma.notifications.groupBy({
      by: ['statut'],
      where: { utilisateur_id: userId },
      _count: {
        id_notification: true
      }
    });

     const total = stats.reduce((sum: number, item: { _count: { id_notification: number; }; }) => sum + item._count.id_notification, 0);
       const nonLues = stats.find((item: { statut: string; _count: { id_notification: number } }) => 
      item.statut === 'non_lu')?._count.id_notification || 0;

    res.json({
      total,
      non_lues: nonLues,
      lues: total - nonLues,
      par_statut: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createBulkNotifications = async (req: Request, res: Response) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'Le champ "notifications" doit être un tableau non vide' });
    }

    // Validation de chaque notification
    for (const notif of notifications) {
      if (!notif.utilisateur_id || !notif.titre || !notif.message) {
        return res.status(400).json({ 
          error: 'Chaque notification doit avoir utilisateur_id, titre et message' 
        });
      }

      // Vérifier que l'utilisateur existe
      const userExists = await prisma.utilisateurs.findUnique({
        where: { id_user: notif.utilisateur_id }
      });

      if (!userExists) {
        return res.status(404).json({ 
          error: `Utilisateur avec ID ${notif.utilisateur_id} non trouvé` 
        });
      }
    }

    const createdNotifications = await prisma.notifications.createMany({
      data: notifications.map(notif => ({
        utilisateur_id: notif.utilisateur_id,
        titre: notif.titre,
        message: notif.message,
        type_notif: notif.type_notif || 'application',
        statut: 'non_lu'
      }))
    });

    res.status(201).json({
      message: `${createdNotifications.count} notification(s) créée(s) avec succès`,
      count: createdNotifications.count
    });
  } catch (error: any) {
    console.error('Erreur lors de la création en masse des notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la création en masse' });
  }
};

// Pour les administrateurs - Récupérer toutes les notifications (tous utilisateurs)
export const getAllNotificationsAdmin = async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user?.role;
    
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const { utilisateur_id, statut, type_notif, page = 1, limit = 50 } = req.query;

    const where: any = {};
    if (utilisateur_id) where.utilisateur_id = Number(utilisateur_id);
    if (statut) where.statut = statut;
    if (type_notif) where.type_notif = type_notif;

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        select: {
          id_notification: true,
          titre: true,
          message: true,
          type_notif: true,
          statut: true,
          date_creation: true,
          date_lu: true,
          utilisateur: {
            select: {
              id_user: true,
              nom: true,
              email: true
            }
          }
        },
        orderBy: { date_creation: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.notifications.count({ where })
    ]);

    res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur admin lors de la récupération des notifications:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
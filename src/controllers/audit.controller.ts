
import { Request, Response } from 'express';
import  prisma from "../models/prismaClient.js";
import{ AuditWhere} from '../typages/audit.js'
import  ResponseApi  from '../helpers/response.js';


export const getAllAuditLogs = async (req: Request, res: Response) => {
  try {
    const data = req.query as any;
    const { 
      utilisateur_id,
      ferme_id,
      table_cible,
      action,
      date_debut,
      date_fin,
      page = 1,
      limit = 50
    } = data;
    
    const userId = (req as any).user?.id_user;
    const userRole = (req as any).user?.role;

    const where: AuditWhere = {};

    // Seuls les admins peuvent voir tous les logs, les autres ne voient que leurs actions
    if (userRole !== 'ADMIN') {
      where.utilisateur_id = userId;
    }

    if (utilisateur_id) where.utilisateur_id = Number(utilisateur_id);
    if (ferme_id) where.ferme_id = Number(ferme_id);
    if (table_cible) where.table_cible = table_cible as string;
    if (action) where.action = action as string;

    // Filtre par date 
    if (date_debut || date_fin) {
      where.date_action = {};
      if (date_debut) where.date_action.gte = new Date(date_debut as string);
      if (date_fin) where.date_action.lte = new Date(date_fin as string);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              roles: true
            }
          },
          farm: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.audit.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getAuditStats = async (req: Request, res: Response) => {
  try {
    const { periode = '30' } = req.query;
    const userId = (req as any).user?.id_user;
    const userRole = (req as any).user?.role;

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - Number(periode));

    
    const where: any = {
      date_action: {
        gte: dateDebut
      }
    };

    // Restrictions pour les non-admins
    if (userRole !== 'ADMIN') {
      where.utilisateur_id = userId;
    }

    const [
      actionsParType,
      actionsParUtilisateur,
      actionsParTable,
      totalActions
    ] = await Promise.all([
      // Actions par type
      prisma.audit.groupBy({
        by: ['action'],
        where,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      // Actions par utilisateur (admin seulement)
      userRole === 'ADMIN' ? prisma.audit.groupBy({
        by: ['id'],
        where,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id : 'desc'
          }
        },
        take: 10
      }) : [],
      // Actions par table
      prisma.audit.groupBy({
        by: ['tableTarget'],
        where,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        }
      }),
      // Total d'actions
      prisma.audit.count({ where })
    ]);

    // Récupérer les noms des utilisateurs pour les stats
    interface UserActionStats {
      id: number;
      user?: {
        id: number;
        name: string;
        email: string;
      };
      _count: {
        id: number;
      };
    }

    let actionsParUtilisateurAvecNoms: UserActionStats[] = [];
    if (userRole === 'ADMIN' && actionsParUtilisateur.length > 0) {
      const userIds = actionsParUtilisateur.map((item: { id: number ; }) => item.id).filter((id: number | null): id is number => id !== null);
      const utilisateurs = await prisma.user.findMany({
        where: { id: { in: userIds as number[] } },
        select: { id: true, name: true, email: true }
      });

     let actionsParUtilisateurAvecNoms = actionsParUtilisateur.map((item: { id: number; _count: { id: number }; }) => {
        const utilisateur = utilisateurs.find((u: { id: number; }) => u.id === item.id) || null;
        return {
          id: item.id,
          user: utilisateur,
          _count: item._count
        };
      });
    }

    res.json({
      periode: `${periode} jours`,
      statistiques: {
        total_actions: totalActions,
        actions_par_type: actionsParType,
        actions_par_utilisateur: actionsParUtilisateurAvecNoms,
        actions_par_table: actionsParTable
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques d\'audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const searchAuditLogs = async (req: Request, res: Response) => {
  try {
    const { 
      search,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const userId = (req as any).user?.id_user;
    const userRole = (req as any).user?.role;

    if (!search) {
      return res.status(400).json({ error: 'Le paramètre "search" est requis' });
    }

    // CORRECTION : Utilisation de any pour éviter les problèmes de type complexes
    const where: any = {
      OR: [
        { table_cible: { contains: search as string } },
        { action: { contains: search as string } },
        { ip_address: { contains: search as string } }
      ]
    };

    // Restrictions pour les non-admins
    if (userRole !== 'ADMIN') {
      where.utilisateur_id = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          farm: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.audit.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      search_term: search
    });
  } catch (error) {
    console.error('Erreur lors de la recherche des logs d\'audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const exportAuditLogs = async (req: Request, res: Response) => {
  try {
    const { 
      format = 'json',
      date_debut,
      date_fin
    } = req.query;
    
    const userId = (req as any).user?.id_user;
    const userRole = (req as any).user?.role;

    
    const where: any = {};

    // Restrictions pour les non-admins
    if (userRole !== 'ADMIN') {
      where.utilisateur_id = userId;
    }

    // Filtre par date
    if (date_debut || date_fin) {
      where.date_action = {};
      if (date_debut) where.date_action.gte = new Date(date_debut as string);
      if (date_fin) where.date_action.lte = new Date(date_fin as string);
    }

    const logs = await prisma.audit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true
          }
        },
        farm: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // Génération CSV simplifiée
      const csvHeaders = 'Date,Utilisateur,Action,Table,ID Cible,IP\n';
      const csvData = logs.map((log: any) => 
        `"${log.date_action || log.createdAt}","${log.user?.name || 'Système'}","${log.action}","${log.table_cible || log.tableTarget}","${log.id_cible || log.targetId || ''}","${log.ip_address || log.ipAddress || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.send(csvHeaders + csvData);
    }

    // Format JSON par défaut
    res.json({
      export_info: {
        format: 'json',
        date_export: new Date(),
        total_logs: logs.length,
        periode: {
          date_debut: date_debut || 'début',
          date_fin: date_fin || 'maintenant'
        }
      },
      logs
    });
  } catch (error) {
    console.error('Erreur lors de l\'export des logs d\'audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Les autres fonctions restent identiques...
export const getAuditLogById = async (req: Request, res: Response) => {
  try {
    const logId = Number(req.params.id);
    const userId = (req as any).user?.id_user;
    const userRole = (req as any).user?.role;

    const where: any = { id_historique: logId };

    // Vérification des permissions
    if (userRole !== 'ADMIN') {
      where.utilisateur_id = userId;
    }

    const log = await prisma.audit.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            roles: true
          }
        },
        farm: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      }
    });

    if (!log) {
      return res.status(404).json({ error: 'Log d\'audit non trouvé' });
    }

    res.json(log);
  } catch (error) {
    console.error('Erreur lors de la récupération du log d\'audit:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;
    const userId = (req as any).user?.id_user;
    const userRole = (req as any).user?.role;

    const where: any = {};

    // Restrictions pour les non-admins
    if (userRole !== 'ADMIN') {
      where.OR = [
        { utilisateur_id: userId },
        { utilisateur_id: null } 
      ];
    }

    const recentActivities = await prisma.audit.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        farm: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    res.json({
      activities: recentActivities,
      total: recentActivities.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des activités récentes:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Service pour logger les actions (à utiliser dans les autres controllers)
export const logAction = async (data: {
  utilisateur_id?: number;
  ferme_id?: number;
  table_cible: string;
  id_cible?: number;
  action: string;
  anciennes_valeurs?: any;
  nouvelles_valeurs?: any;
  ip_address?: string;
}) => {
  try {
    await prisma.audit.create({
      data: {
        userId: data.utilisateur_id || null,
        farmId: data.ferme_id || null,
        tableTarget: data.table_cible,
        recordId: data.id_cible || null,
        action: data.action,
        previousData: data.anciennes_valeurs || null,
        newData: data.nouvelles_valeurs || null,
        ipAddress: data.ip_address || null,
       createdAt: new Date()
      }
    });
  } catch (error) {
    console.error('Erreur lors du logging de l\'action:', error);
    // Ne pas throw l'erreur pour ne pas interrompre le flux principal
  }
};
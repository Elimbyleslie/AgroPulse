import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import ResponseApi from "../helpers/response.js";
import { Role } from "../typages/role.js"; 

// ============================================
// GET ALL (avec filtres + pagination + rôle)
// ============================================
export const getAllAudits = async (
  req: Request<
    {},
    {},
    {},
    {
      userId?: string;
      organizationId?: string;
      farmId?: string;
      tableTarget?: string;
      action?: string;
      dateDebut?: string;
      dateFin?: string;
      page?: string;
      limit?: string;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      userId,
      organizationId,
      farmId,
      tableTarget,
      action,
      dateDebut,
      dateFin,
    } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // ── Utilisateur connecté ──────────────────────────────────────────────
    const currentUser = (req as any).user;
    if (!currentUser) {
      return ResponseApi.error(res, "Non authentifié", 401);
    }

    const currentUserId = currentUser.id || currentUser.id_user;

    // Extraction des rôles (adaptez selon la forme de req.user)
    const currentRoles: string[] =
      currentUser.roles?.map((r: any) =>
        typeof r === "string" ? r : r.role?.name || r.name
      ) || (currentUser.role ? [currentUser.role] : []);

    const isSuperAdmin = currentRoles.includes(Role.SUPER_ADMIN);
    const isAdmin = currentRoles.includes(Role.ADMIN);
    const isOrgOwner = currentRoles.includes(Role.ORGANIZATION_OWNER);

    // Seuls Super Admin, Admin et Organization Owner ont accès
    if (!isSuperAdmin && !isAdmin && !isOrgOwner) {
      return ResponseApi.error(
        res,
        "Accès refusé. Vous n'avez pas les droits pour consulter les audits.",
        403
      );
    }

    // ── Construction du filtre ────────────────────────────────────────────
    const where: any = {};

    // Filtres envoyés par le client
    if (userId) where.userId = Number(userId);
    if (organizationId) where.organizationId = Number(organizationId);
    if (farmId) where.farmId = Number(farmId);
    if (tableTarget) where.tableTarget = tableTarget;
    if (action) where.action = action;

    // Filtre date
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt.gte = new Date(dateDebut);
      if (dateFin) where.createdAt.lte = new Date(dateFin);
    }

    // ── Restriction selon le rôle ─────────────────────────────────────────
    if (isOrgOwner && !isSuperAdmin && !isAdmin) {
      // Récupérer les organisations que possède l'owner
      const ownedOrgs = await prisma.organization.findMany({
        where: { ownerId: currentUserId },
        select: { id: true },
      });

      const orgIds = ownedOrgs.map((org) => org.id);

      // Fallback
      if (orgIds.length === 0 && currentUser.defaultOrganizationId) {
        orgIds.push(currentUser.defaultOrganizationId);
      }

      if (orgIds.length === 0) {
        return ResponseApi.success(res, "Liste des audits récupérée", 200, {
          audits: [],
          pagination: {
            currentPage: page,
            previousPage: null,
            nextPage: null,
            totalItems: 0,
            totalPage: 1,
          },
        });
      }

      // L'owner ne voit que les audits de ses organisations
      // (on respecte aussi le filtre organizationId s'il a été fourni)
      if (where.organizationId) {
        // Vérifier que l'org demandée appartient bien à l'owner
        if (!orgIds.includes(where.organizationId)) {
          return ResponseApi.error(
            res,
            "Vous n'avez pas accès aux audits de cette organisation",
            403
          );
        }
      } else {
        where.organizationId = { in: orgIds };
      }
    }

    // Super Admin & Admin → aucun filtre supplémentaire (voient tout)

    // ── Requête ───────────────────────────────────────────────────────────
    const [audits, totalItems] = await Promise.all([
      prisma.audit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          farm: {
            select: {
              id: true,
              name: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.audit.count({ where }),
    ]);

    return ResponseApi.success(res, "Liste des audits récupérée", 200, {
      audits,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET BY ID
// ============================================
export const getAuditById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const auditId = Number(req.params.id);
    const currentUserId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const where: any = { id: auditId };

    if (userRole !== "ADMIN") {
      where.userId = currentUserId;
    }

    const audit = await prisma.audit.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        farm: {
          select: {
            id: true,
            name: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!audit) {
      return ResponseApi.error(res, "Audit non trouvé", 404);
    }

    return ResponseApi.success(res, "Audit récupéré", 200, audit);
  } catch (error) {
    next(error);
  }
};

// ============================================
// SEARCH
// ============================================
export const searchAudits = async (
  req: Request<{}, {}, {}, { search?: string; page?: string; limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    if (!search) {
      return ResponseApi.error(res, 'Le paramètre "search" est requis', 400);
    }

    const currentUserId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const where: any = {
      OR: [
        { tableTarget: { contains: search as string, mode: "insensitive" } },
        { action: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { ipAddress: { contains: search as string, mode: "insensitive" } },
      ],
    };

    if (userRole !== "ADMIN") {
      where.userId = currentUserId;
    }

    const [audits, totalItems] = await Promise.all([
      prisma.audit.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          farm: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.audit.count({ where }),
    ]);

    return ResponseApi.success(res, "Résultats de recherche", 200, {
      audits,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page * limit < totalItems ? page + 1 : null,
        totalItems,
        totalPage: Math.ceil(totalItems / limit),
      },
      searchTerm: search,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// STATISTIQUES
// ============================================
export const getAuditStats = async (
  req: Request<{}, {}, {}, { periode?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const periode = Number(req.query.periode) || 30;
    const currentUserId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() - periode);

    const where: any = {
      createdAt: { gte: dateDebut },
    };

    if (userRole !== "ADMIN") {
      where.userId = currentUserId;
    }

    const [actionsParType, actionsParTable, totalActions, topUsersRaw] =
      await Promise.all([
        prisma.audit.groupBy({
          by: ["action"],
          where,
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        prisma.audit.groupBy({
          by: ["tableTarget"],
          where,
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        prisma.audit.count({ where }),
        userRole === "ADMIN"
          ? prisma.audit.groupBy({
              by: ["userId"],
              where: { ...where, userId: { not: null } },
              _count: { id: true },
              orderBy: { _count: { id: "desc" } },
              take: 10,
            })
          : Promise.resolve([]),
      ]);

    // Enrichir les top users avec leurs infos
    let actionsParUtilisateur: any[] = [];
    if (userRole === "ADMIN" && topUsersRaw.length > 0) {
      const userIds = topUsersRaw
        .map((item) => item.userId)
        .filter((id): id is number => id !== null);

      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      });

      actionsParUtilisateur = topUsersRaw.map((item) => ({
        userId: item.userId,
        count: item._count.id,
        user: users.find((u) => u.id === item.userId) || null,
      }));
    }

    return ResponseApi.success(res, "Statistiques d'audit", 200, {
      periode: `${periode} jours`,
      statistiques: {
        totalActions,
        actionsParType,
        actionsParTable,
        actionsParUtilisateur,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ACTIVITÉS RÉCENTES
// ============================================
export const getRecentActivities = async (
  req: Request<{}, {}, {}, { limit?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const currentUserId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const where: any = {};

    if (userRole !== "ADMIN") {
      where.OR = [{ userId: currentUserId }, { userId: null }];
    }

    const activities = await prisma.audit.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return ResponseApi.success(res, "Activités récentes", 200, {
      activities,
      total: activities.length,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// EXPORT
// ============================================
export const exportAudits = async (
  req: Request<
    {},
    {},
    {},
    { format?: string; dateDebut?: string; dateFin?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const { format = "json", dateDebut, dateFin } = req.query;
    const currentUserId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const where: any = {};

    if (userRole !== "ADMIN") {
      where.userId = currentUserId;
    }

    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) where.createdAt.gte = new Date(dateDebut);
      if (dateFin) where.createdAt.lte = new Date(dateFin);
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        farm: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const csvHeaders =
        "Date,Utilisateur,Email,Action,Table,RecordId,IP,Description\n";

      const csvData = audits
        .map((log) => {
          const date = log.createdAt.toISOString();
          const userName = log.user?.name || "Système";
          const userEmail = log.user?.email || "";
          const desc = (log.description || "").replace(/"/g, '""');

          return `"${date}","${userName}","${userEmail}","${log.action}","${log.tableTarget}","${log.recordId || ""}","${log.ipAddress || ""}","${desc}"`;
        })
        .join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit-logs.csv"
      );
      return res.send(csvHeaders + csvData);
    }

    // JSON par défaut
    return ResponseApi.success(res, "Export des audits", 200, {
      exportInfo: {
        format: "json",
        dateExport: new Date(),
        totalLogs: audits.length,
        periode: {
          dateDebut: dateDebut || "début",
          dateFin: dateFin || "maintenant",
        },
      },
      audits,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// SERVICE : Logger une action (à utiliser partout)
// ============================================
export const logAction = async (data: {
  userId?: number | null;
  organizationId?: number | null;
  farmId?: number | null;
  tableTarget: string;
  action: string;
  recordId?: number | null;
  description?: string | null;
  previousData?: any;
  newData?: any;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  try {
    await prisma.audit.create({
      data: {
        userId: data.userId ?? null,
        organizationId: data.organizationId ?? null,
        farmId: data.farmId ?? null,
        tableTarget: data.tableTarget,
        action: data.action,
        recordId: data.recordId ?? null,
        description: data.description ?? null,
        previousData: data.previousData ?? null,
        newData: data.newData ?? null,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("Erreur lors du logging de l'action:", error);
  }
};
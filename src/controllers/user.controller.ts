import { Request, Response,NextFunction } from 'express';
import  prisma  from '../models/prismaClient.js'; // Assurez-vous que le chemin est correct
import ResponseApi from '../helpers/response.js';
import bcrypt from 'bcryptjs';
import { logAction } from './audit.controller.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { User } from '../typages/user.js';

  // 🧩 Récupérer tous les utilisateurs
  export const getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({
        include: {
          roles: true, // si tu as une table UserRole reliée
          organization: true,
        },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
    }
  };

  // 🔍 Récupérer un utilisateur par ID
  export const getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
       if (!id)
      res.status(422).json({
        message: 'Id is missing !!!',
        data: null,
      });
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          roles: true,
          organization: true,
        },
      });
      if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Erreur serveur', error });
    }
  };

  // ➕ Créer un nouvel utilisateur
  // export const createUser = async (req: Request, res: Response) => {
  //   try {
  //     const { name, email, passwordHash, organizationId, roleIds } = req.body;

  //     // Vérifie si l'email existe déjà
  //     const existing = await prisma.user.findUnique({ where: { email } });
  //     if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

  //     // Crée l’utilisateur
  //     const user = await prisma.user.create({
  //       data: {
  //         name,
  //         email,
  //         passwordHash, // (ici tu pourras hasher le mot de passe comme dans auth.controller)
  //         organizationId,
  //         roles: {
  //           create: roleIds?.map((roleId: number) => ({ roleId })) || [],
  //         },
  //       },
  //       include: { roles: true },
  //     });
  //    const saltRounds = 10;
  //   const salt = await bcrypt.genSalt(saltRounds);
  //   const hash = await bcrypt.hash(passwordHash, salt);
  //   data.passwordHash = hash;

  //   delete data.passwordConfirmation;
  //   const result = await prisma.user.create({ data });
  //     res.status(201).json({ message: 'Utilisateur créé avec succès', user });
  //   } catch (error) {
  //     res.status(500).json({ message: 'Erreur lors de la création', error });
  //   }
  // },
  
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, userName, password, phone, status, roleId, passwordConfirmation } = req.body;

    // Vérification de base
    if (!email || !password || !name) {
      return ResponseApi.error(res, 'Nom, email et mot de passe requis.', 400);
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { name }],
      },
    });
    if (existingUser) {
      return ResponseApi.error(res, 'Email ou nom déjà utilisé.', 409);
    }

    // Vérifier la confirmation de mot de passe
    if (passwordConfirmation && password !== passwordConfirmation) {
      return ResponseApi.error(res, 'Les mots de passe ne correspondent pas.', 400);
    }

    // Hachage du mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Création de l'utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        userName,
        phone,
        status: status || 'active',
        password,
        roles: roleId
          ? {
              create: {
                roleId,
                assignedBy: req.user?.email || 'system',
              },
            }
          : undefined,
      },
    });

    return ResponseApi.success(res, 'Utilisateur créé avec succès !', 201, newUser);
  } catch (error) {
  
    next(error);
  }
};


  // ✏️ Mettre à jour un utilisateur
  export const updateUser = async(req: Request, res: Response)=> {
    try {
      const { id } = req.params;
      const { name, email, organizationId, roleIds } = req.body;
       if (!id)
      res.status(422).json({
        message: 'Id is missing !!!',
        data: null,
      });
      const user = await prisma.user.update({
        where: { id: Number(id) },
        data: {
          name,
          email,
          organizationId,
          roles: {
            deleteMany: {}, // supprime les anciens rôles
            create: roleIds?.map((roleId: number) => ({ roleId })) || [],
          },
        },
        include: { roles: true },
      });

      res.json({ message: 'Utilisateur mis à jour', user });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la mise à jour', error });
    }
  };

  // 🗑️ Supprimer un utilisateur
   export const deleteUser= async(req: Request, res: Response,next:NextFunction) => {
    try {
      const { id } = req.params;
        if (!id)
      return res.status(422).json({
        message: 'Id is missing !!!',
        data: null,
      });

      const userExist = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!userExist) return res.status(404).json({ message: 'Utilisateur non trouvé' });

      const deleted = await prisma.user.delete({ where: { id: Number(id) } });

       await logAction({
      utilisateur_id: Number(id),
      table_cible: 'utilisateurs',
      id_cible: Number(id),
      action: 'suppression_utilisateur',
      anciennes_valeurs: userExist,
      nouvelles_valeurs: deleted,
      ip_address: req.ip
    });

      res.json({ message: 'Utilisateur supprimé', deleted });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la suppression', error });
      next(error)
    }

  };

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roles: user.roles
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

/**
 * 🛠️ Mettre à jour le profil de l'utilisateur connecté
 */
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    const { userName, email, phone, password } = req.body;

    const dataToUpdate: any = {};

    if (userName) dataToUpdate.userName = userName;
    if (email) dataToUpdate.email = email;
    if (phone) dataToUpdate.phone = phone;
    if (password) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      select: {
        id: true,
        userName: true,
        email: true,
        phone: true,
        status: true
      }
    });

    res.status(200).json({
      message: "Profil mis à jour avec succès ✅",
      user: updatedUser
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

export const assignRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: 'roleId est requis' });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ error: 'Rôle introuvable' });
    }

    // Provide the required assignedBy field; prefer authenticated user email if available
    const assignedBy = (req as any).user?.email || 'system';

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { roles: { create: { roleId, assignedBy } } },
      include: { roles: true },
    });

    return res.status(200).json({
      message: 'Rôle attribué avec succès',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Erreur assignation rôle:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de l’attribution du rôle' });
  }
};
export const removeRole = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ error: "roleId est requis" });
    }

    // Vérifie si l’association existe
    const userRole = await prisma.userRole.findFirst({
      where: { userId, roleId },
    });

    if (!userRole) {
      return res.status(404).json({
        error: "Ce rôle n’est pas attribué à cet utilisateur",
      });
    }

    // Supprime l’association
    await prisma.userRole.delete({
      where : { userId_roleId : userRole}
    });

    return res.status(200).json({
      message: "Rôle retiré avec succès à l’utilisateur",
    });
  } catch (error: any) {
    console.error("Erreur suppression rôle:", error);
    return res.status(500).json({
      error: "Erreur serveur lors du retrait du rôle",
    });
  }
};

export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const roles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    return res.status(200).json(roles.map((r: { role: any }) => r.role) as any[]);
  } catch (error: any) {
    console.error("Erreur récupération rôles:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};

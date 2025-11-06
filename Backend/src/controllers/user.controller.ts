import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logAction } from '../controllers/audit.controller';

const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.utilisateurs.findMany({
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.utilisateurs.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true,
        fermes_proprietaire: {
          select: {
            id_ferme: true,
            nom: true,
            adresse: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { nom, email, password, confirmPassword, role, telephone } = req.body;
    const userId = (req as any).user?.id_user;

    // Validation des champs requis
    if (!nom) return res.status(400).json({ error: 'Le champ "nom" est requis' });
    if (!email) return res.status(400).json({ error: 'Le champ "email" est requis' });
    if (!password) return res.status(400).json({ error: 'Le champ "password" est requis' });
    if (!confirmPassword) return res.status(400).json({ error: 'Le champ "confirmPassword" est requis' });

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.utilisateurs.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.utilisateurs.create({
      data: {
        nom,
        email,
        mot_de_passe: hashedPassword,
        role: role || 'EMPLOYE',
        telephone,
        statut: 'ACTIF'
      },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true
      }
    });

    // ✅ AJOUT AUDIT - Création utilisateur
    await logAction({
      utilisateur_id: userId,
      table_cible: 'utilisateurs',
      id_cible: newUser.id_user,
      action: 'creation',
      nouvelles_valeurs: newUser,
      ip_address: req.ip
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nom, email, role, telephone, statut, password, confirmPassword } = req.body;
    const userId = (req as any).user?.id_user;

    const userExist = await prisma.utilisateurs.findUnique({ 
      where: { id_user: id },
      select: {
        id_user: true,
        nom: true,
        email: true,
        mot_de_passe: true,
        role: true,
        telephone: true,
        statut: true,
        date_creation: true
      }
    });
    
    if (!userExist) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== userExist.email) {
      const emailExists = await prisma.utilisateurs.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      nom: nom ?? userExist.nom,
      email: email ?? userExist.email,
      role: role ?? undefined,
      telephone: telephone ?? undefined,
      statut: statut ?? undefined
    };

    // Gestion du mot de passe si fourni
    if (password) {
      if (!confirmPassword) {
        return res.status(400).json({ error: 'Le champ "confirmPassword" est requis pour changer le mot de passe' });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }

      updateData.mot_de_passe = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.utilisateurs.update({
      where: { id_user: id },
      data: updateData,
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true
      }
    });

    // ✅ AJOUT AUDIT - Modification utilisateur
    await logAction({
      utilisateur_id: userId,
      table_cible: 'utilisateurs',
      id_cible: id,
      action: 'modification',
      anciennes_valeurs: userExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const userId = (req as any).user?.id_user;

    // Vérifier si l'utilisateur existe
    const userExist = await prisma.utilisateurs.findUnique({
      where: { id_user: id },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        statut: true,
        date_creation: true
      }
    });

    if (!userExist) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier si l'utilisateur est propriétaire de fermes
    const userFermes = await prisma.fermes.findMany({
      where: { proprietaire_id: id }
    });

    if (userFermes.length > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer cet utilisateur car il est propriétaire de fermes' 
      });
    }

    await prisma.utilisateurs.delete({
      where: { id_user: id }
    });

    // ✅ AJOUT AUDIT - Suppression utilisateur
    await logAction({
      utilisateur_id: userId,
      table_cible: 'utilisateurs',
      id_cible: id,
      action: 'suppression',
      anciennes_valeurs: userExist,
      ip_address: req.ip
    });

    res.status(204).send();
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;
    
    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const user = await prisma.utilisateurs.findUnique({
      where: { id_user: userId },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true,
        fermes_proprietaire: {
          select: {
            id_ferme: true,
            nom: true,
            adresse: true,
            _count: {
              select: {
                animaux: true,
                lots: true
              }
            }
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;
    const { nom, email, telephone, password, confirmPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    const userExist = await prisma.utilisateurs.findUnique({ 
      where: { id_user: userId },
      select: {
        id_user: true,
        nom: true,
        email: true,
        mot_de_passe: true,
        role: true,
        telephone: true,
        statut: true,
        date_creation: true
      }
    });
    
    if (!userExist) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== userExist.email) {
      const emailExists = await prisma.utilisateurs.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      nom: nom ?? userExist.nom,
      email: email ?? userExist.email,
      telephone: telephone ?? undefined
    };

    // Gestion du mot de passe si fourni
    if (password) {
      if (!confirmPassword) {
        return res.status(400).json({ error: 'Le champ "confirmPassword" est requis pour changer le mot de passe' });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }

      updateData.mot_de_passe = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.utilisateurs.update({
      where: { id_user: userId },
      data: updateData,
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true
      }
    });

    // ✅ AJOUT AUDIT - Modification profil utilisateur
    await logAction({
      utilisateur_id: userId,
      table_cible: 'utilisateurs',
      id_cible: userId,
      action: 'modification_profil',
      anciennes_valeurs: userExist,
      nouvelles_valeurs: updated,
      ip_address: req.ip
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
};

export const changeUserStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { statut } = req.body;
    const userId = (req as any).user?.id_user;

    // Validation
    if (!statut || !['ACTIF', 'INACTIF', 'SUSPENDU'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const userExist = await prisma.utilisateurs.findUnique({ 
      where: { id_user: id },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        statut: true,
        date_creation: true
      }
    });
    
    if (!userExist) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const updated = await prisma.utilisateurs.update({
      where: { id_user: id },
      data: { statut },
      select: {
        id_user: true,
        nom: true,
        email: true,
        role: true,
        telephone: true,
        date_creation: true,
        statut: true
      }
    });

    // ✅ AJOUT AUDIT - Changement de statut utilisateur
    await logAction({
      utilisateur_id: userId,
      table_cible: 'utilisateurs',
      id_cible: id,
      action: 'changement_statut',
      anciennes_valeurs: { statut: userExist.statut },
      nouvelles_valeurs: { statut },
      ip_address: req.ip
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors du changement de statut' });
  }
};
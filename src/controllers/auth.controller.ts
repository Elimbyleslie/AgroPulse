import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis.' });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
        include: {
          userRoles: {
            // Include the UsersOnRoles relation
            include: {
              role: {
                // Include the Role model
                include: {
                  permissions: {
                    // Include the PermissionsOnRoles relation
                    include: {
                      permission: true, // Include the Permission model
                    },
                  },
                },
              },
            },
          },
        },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    // Vérifier le statut
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Compte désactivé.' });
    }

    // Vérifier que les secrets JWT sont définis
    if (!process.env.JWT_SECRET || !process.env.REFRESH_JWT_SECRET) {
      throw new Error('Secrets JWT non configurés');
    }

    // Générer les tokens
    const accessToken = jwt.sign(
      { 
        id_user: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      },
      process.env.JWT_SECRET
    );

    const refreshToken = jwt.sign(
      { 
        id_user: user.id,
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 jours
      },
      process.env.REFRESH_JWT_SECRET
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        accessToken,
        refreshToken,
        user: {
          id_user: user.id,
          nom: user.name,
          email: user.email,
          role: user.userRoles[0]?.role?.id,
          telephone: user.phone
        }
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requis.' });
    }

    if (!process.env.REFRESH_JWT_SECRET || !process.env.JWT_SECRET) {
      throw new Error('Secrets JWT non configurés');
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id_user }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé.' });
    }

    // Générer un nouveau access token (même méthode que login)
    const newAccessToken = jwt.sign(
      { 
        id_user: user.id, 
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + (15 * 60) // 15 minutes
      },
      process.env.JWT_SECRET
    );

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    console.error('Erreur refreshToken:', error);
    res.status(401).json({ error: 'Refresh token invalide.' });
  }
};
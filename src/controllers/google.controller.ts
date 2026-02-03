import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import {   assignSuperAdminIfEligible} from "./AssignRole.js";
export const googleCallbackController = async (req: Request, res: Response) => {
  const googleUser = req.user as {
    email: string;
    name: string;
    photo?: string;
  };

  if (!googleUser?.email) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/auth/google/callback?error=google_auth_failed`,
    );
  }

  let user = await prisma.user.findUnique({
    where: { email: googleUser.email },
    include: { roles: { include: { role: true } } }, // On essaie de charger les rôles direct
  });

  // 1️⃣ Auto-register si nouveau
  if (!user) {
    const newUser = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        photo: googleUser.photo,
        password: "", 
        provider: "GOOGLE",
        emailVerified: true, 
        userName: googleUser.email.split("@")[0],
        googleId: googleUser.email.split("@")[0],
      },
    });

    // 💡 UTILISATION DE LA NOUVELLE FONCTION
    // Elle va décider seule entre SUPER_ADMIN (si < 5) ou ADMIN
    // await assignSuperAdminIfEligible(newUser.id);
    await assignSuperAdminIfEligible(newUser.id);

    
    user = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        roles: {
          include: { role: true },
        },
        memberOrganizations: {
          include: {
            farms: {
              include: {
                animals: true,
              },
            },
          },
        },
        ownedOrganizations: {
          include: {
            farms: {
              include: {
                animals: true,
              },
            },
          },
        },  
      },

    }) as any; 
  }

  // 2️⃣ Login normal (JWT)
  // On passe souvent l'ID et parfois le rôle dans le token pour faciliter le décodage au front
  const accessToken = jwt.sign({ id_user: user?.id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  return res.redirect(
    `${process.env.FRONTEND_URL}/auth/google/callback?token=${accessToken}`,
  );
};

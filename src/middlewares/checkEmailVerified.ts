import { Request, Response, NextFunction } from "express";
import prisma from "../models/prismaClient.js";
import Utilities from "../helpers/utilities.js";
import nodemailer from "nodemailer";
import env from "../config/env.js";

function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 chiffres
}

export const checkEmailVerified = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id_user;
    if (!userId) {
      return res.status(401).json(Utilities.errorResponse(401, "Utilisateur non authentifié."));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true, otp: true, otpExpiresAt: true },
    });

    if (!user) {
      return res.status(404).json(Utilities.errorResponse(404, "Utilisateur non trouvé."));
    }

    if (!user.emailVerified) {
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Mettre à jour l'utilisateur avec le nouveau code OTP
      await prisma.user.update({
        where: { id: userId },
        data: { otp, otpExpiresAt: expiresAt },
      });

      // Envoyer l'email
      const transporter = nodemailer.createTransport({
     host: env.mailHost,
    port: parseInt(env.mailPort, 10),
    secure: env.mailSecure === 'true',
    auth: {
      user: env.mailUser, // L'adresse email à utiliser
      pass: env.mailPassword,
  },
  tls: {
    rejectUnauthorized: false, // ignore les certificats auto-signés
  },
      });

      await transporter.sendMail({
        from: `"AgroPulse" <${env.mailUser}>`,
        to: user.email,
        subject: "Code OTP pour vérifier votre email",
        html: `<p>Bonjour,</p>
               <p>Voici votre code de vérification : <b>${otp}</b></p>
               <p>Il expire dans 10 minutes.</p>`,
      });

      return res.status(403).json(
        Utilities.errorResponse(
          403,
          "Votre email n'est pas vérifié. Un code OTP a été envoyé à votre email.",
          { action: "verify-email-otp" }
        )
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

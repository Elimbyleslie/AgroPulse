import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
import { RegisterUser, LoginUser, ResetPassword } from "../typages/auth.js";
import speakeasy from "speakeasy";
import Utilities from "../helpers/utilities.js";
import { sendMail } from "../services/mail.service.js";
import {assignSuperAdminIfEligible} from '../controllers/role.controller.js'
import crypto from "crypto";

//=====================Login=====================
export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Email et mot de passe requis."));
    }

    // 1️⃣ Récupérer l'utilisateur avec ses rôles et permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res
        .status(401)
        .json(Utilities.errorResponse(401, "Email ou mot de passe incorrect."));
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json(Utilities.errorResponse(401, "Email ou mot de passe incorrect."));
    }

    if (user.status !== "active") {
      return res
        .status(403)
        .json(Utilities.errorResponse(403, "Compte désactivé."));
    }

    if (!process.env.JWT_SECRET || !process.env.REFRESH_JWT_SECRET) {
      throw new Error("Secrets JWT non configurés");
    }

    // 2️⃣ Création des tokens JWT
    const accessToken = jwt.sign(
      { id_user: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id_user: user.id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 3️⃣ Ajouter le refreshToken en cookie HTTP-Only
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // 4️⃣ Mapper les rôles et permissions
    const userRoles = user.roles
      .map((ur:any) => {
        if (!ur.role) return null;
        return {
          id: ur.role.id,
          name: ur.role.name,
          description: ur.role.description,
          permissions: ur.role.permissions.map((rp:any) => rp.permission.code),
        };
      })
      .filter(Boolean);

    // 5️⃣ Retourner la réponse
    return res.status(200).json(
      Utilities.successReponse(200, "Connexion réussie", {
        refreshToken,
        accessToken,
        user: {
          id_user: user.id,
          nom: user.name,
          email: user.email,
          telephone: user.phone,
          roles: userRoles,
        },
      })
    );
  } catch (error) {
    next(error);
  }
};
/** REFRESH TOKEN */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res
        .status(401)
        .json(Utilities.errorResponse(401, "Refresh token manquant."));
    }

    const decoded = jwt.verify(token, process.env.REFRESH_JWT_SECRET!) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id_user },
    });
    if (!user) {
      return res
        .status(401)
        .json(Utilities.errorResponse(401, "Utilisateur non trouvé."));
    }

    const newAccessToken = jwt.sign(
      { id_user: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return res.status(200).json(
      Utilities.successReponse(200, "Nouveau token généré", {
        accessToken: newAccessToken,
      })
    );
  } catch (error) {
    return res
      .status(401)
      .json(Utilities.errorResponse(401, "Refresh token invalide."));
  }
};

/** REGISTER */
export const register = async (
  req: Request<any, any, RegisterUser>,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return res
        .status(409)
        .json(Utilities.errorResponse(409, "User already exists"));
    }
    // Vérification mot de passe + confirmation
    if (data.password !== data.passwordConfirmation) {
      return res
        .status(400)
        .json(
          Utilities.errorResponse(
            400,
            "Les mots de passe ne correspondent pas."
          )
        );
    }
    // Hash du mot de passe
    const hashedPassword = await Utilities.hashPassword(data.password);

    // Générer secret + OTP
    const secretKey = speakeasy.generateSecret({ name: data.email }).base32;
    const otp = speakeasy.totp({
      secret: secretKey,
      encoding: "base32",
      digits: 5,
      step: 600,
    });
    console.log("====================================");
    console.log(secretKey, otp);
    console.log("====================================");
    // Gérer l'upload de la photo de profil si présente
    let profilePhoto = "/uploads/default_profile.png";
    if (req.files?.photo) {
      profilePhoto = await Utilities.saveFile(
        req.files.photo as any,
        "uploads/profiles"
      );
      profilePhoto = Utilities.resolveFileUrl(req, profilePhoto);
    }

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: data.name,
        userName: data.userName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        photo: profilePhoto,
        otp,
        secretOtp: secretKey,
        otpExpiresAt: new Date(Date.now() + 600000),
      },  
    });

     await assignSuperAdminIfEligible(user.id);
    // Envoi email OTP
    await sendMail({
      to: data.email,
      name: data.name,
      type: "welcome",
      otp: Number(otp),
      subject: "Validate your account",
    });
    console.log("====================================");
    console.log("OTP sent:", otp);
    console.log("====================================");

    // Retirer les données sensibles avant de renvoyer
    const safeUser = {
      ...user,
      password: undefined,
      secretOtp: undefined,
      otp: undefined,
    };

    res
      .status(201)
      .json(
        Utilities.successReponse(
          201,
          "User created successfully. OTP sent to email.",
          safeUser
        )
      );
  } catch (error) {
    next(error);
  }
};

export const sendEmailVerificationOTP = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id_user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Génère un OTP à 6 chiffres
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Génère un secret pour la sécurité
    const secret = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: userId },
      data: {
        otp,
        secretOtp: secret,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // expire dans 10 minutes
      },
    });

    // Envoi de l'email
  await sendMail({
      to: user.email,
      name: user.name,
      type: "verifyEmail",
      otp: Number(otp),
      subject: "Verifier votre email",
    });

    return res.json({ message: "OTP envoyé à votre email." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erreur interne." });
  }
};
/** RESET PASSWORD */

interface SetNewPasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

interface ResetPasswordBody {
  email: string;
}

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordBody>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json(Utilities.errorResponse(404, "Utilisateur introuvable."));
    }

    // Générer un secret Speakeasy unique si l'utilisateur n'en a pas
    let secretOtp = user.secretOtp;
    if (!secretOtp) {
      secretOtp = speakeasy.generateSecret({ length: 20 }).base32;
      await prisma.user.update({
        where: { id: user.id },
        data: { secretOtp },
      });
    }

    // Générer un OTP TOTP valide pour 15 minutes
    const resetOtp = speakeasy.totp({
      secret: secretOtp,
      encoding: "base32",
      digits: 6, // 6 chiffres pour l'OTP
      step: 900, // 900 secondes = 15 minutes
    });

    // Sauvegarder l'expiration dans la DB
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: resetOtp, otpExpiresAt },
    });

    // Envoyer l’email avec le code OTP
    await sendMail({
      to: email,
      name: user.name,
      type: "resetPassword",
      otp: Number(resetOtp),
      subject: "Réinitialisation de mot de passe",
    });

    return res.status(200).json(
      Utilities.successReponse(
        200,
        "Email de réinitialisation envoyé ! Veuillez vérifier votre boîte de réception.",
        {}
      )
    );
  } catch (error) {
    next(error);
  }
};


/** LOGOUT */
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true, // ⚠ mettre false en local sans HTTPS
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion.",
    });
  }
};

export const saveOtpToUser = async (
  userId: number,
  otp: string,
  expiresAt: Date
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      otp,
      otpExpiresAt: expiresAt,
    },
  });
};

export const verifyOtp = async (req: Request, res: Response) => {

  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.secretOtp) {
     res.status(409).json(Utilities.errorResponse(404, 'Utilisateur ou secret OTP invalide'));
      return;
  }

  // Vérifier le code TOTP
  const isValid = speakeasy.totp.verify({
    secret: user.secretOtp,
    encoding: "base32",
    token: otp,
    window: 2, // tolérance de 60 secondes
  });

  if (!isValid) {
    res.status(409).json(Utilities.errorResponse(400, 'OTP invalide ou expiré'));
      return;
  }

  // Mise à jour de la dernière connexion
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastConnexion: new Date(),
    },
  });

  return {
    success: true,
    message: "OTP vérifié avec succès",
    userId: user.id,
  };

  
};

export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const userId = (req as any).user?.id_user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "OTP incorrect." });
    }

    if (!user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP expiré." });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expiré." });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        otp: null,
        secretOtp: null,
        otpExpiresAt: null,
      },
    });

    return res.json({ message: "Email vérifié avec succès !" });
  } catch (error) {
    return res.status(500).json({ message: "Erreur interne." });
  }
};


export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res.status(404).json(Utilities.errorResponse(404, "Utilisateur introuvable."));
    return;
  }
  const secretKey = speakeasy.generateSecret({ name: email }).base32;

  const otp = speakeasy.totp({
    secret: secretKey,
    encoding: "base32",
    digits: 6,
    step: 600, // 600 secondes → 10 minutes
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await saveOtpToUser(user.id, otp, expiresAt);

  // Envoi email OTP
  await sendMail({
    to: user.email,
    name: user.name,
    type: "verifyEmail",
    otp: Number(otp),
    subject: "Votre nouveau code OTP",
  });

  res.status(200).json({
    success: true,
    message: "OTP renvoyé avec succès",
  })
};

interface UpdatePasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

export const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json(Utilities.errorResponse(404, "Utilisateur introuvable."));
    }

    // Vérifier OTP et expiration
    const now = new Date();
    if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < now || user.otp !== otp) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "OTP invalide ou expiré."));
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et effacer OTP
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return res
      .status(200)
      .json(Utilities.successReponse(200, "Mot de passe mis à jour avec succès." ,updatedUser));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => { 

  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id_user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non rencontré." });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return res
      .status(200)
      .json(Utilities.successReponse(200, "Mot de passe mis à jour avec succès." ,updatedUser));
  } catch (error) {
    next(error);
  }
};



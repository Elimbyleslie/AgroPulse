import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "../models/prismaClient.js";
import { RegisterUser, LoginUser, ResetPassword } from "../typages/auth.js";
import speakeasy from "speakeasy";
import Utilities from "../helpers/utilities.js";
import { sendMail } from "../services/mail.service.js";
import { assignSuperAdminIfEligible } from "./AssignRole.js";
import crypto from "crypto";
import { date } from "yup";

//=====================Login=====================
export const login = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Email et mot de passe requis."));
    }

    // 1️⃣ Récupérer l'utilisateur avec rôles et permissions
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedOrganizations: {
          include: {
            farms: {
              include: {
                animals: true,
              },
            },
          },
        },
        memberOrganizations: true,
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
        .json(
          Utilities.errorResponse(
            401,
            " cet utilisateur n'existe pas. veuillez creer un compte ",
          ),
        );
    }

    // 🔐 Bloquer login local si compte Google
    if (user.provider === "GOOGLE") {
      return res
        .status(400)
        .json(
          Utilities.errorResponse(
            400,
            "Ce compte utilise la connexion Google. Veuillez vous connecter avec Google.",
          ),
        );
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

    // 📧 Email non vérifié → OTP requis
    if (!user.emailVerified) {
      return res.status(403).json(
        Utilities.errorResponse(403, "Email non vérifié.", {
          emailVerified: false,
          email: user.email,
        }),
      );
    }

    if (!process.env.JWT_SECRET || !process.env.REFRESH_JWT_SECRET) {
      throw new Error("Secrets JWT non configurés");
    }

    // 2️⃣ Création des tokens JWT
    const accessToken = jwt.sign(
      { id_user: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { id_user: user.id },
      process.env.REFRESH_JWT_SECRET,
      { expiresIn: "7d" },
    );

    // 3️⃣ Cookie refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // 4️⃣ Mapper rôles et permissions
    const userRoles = user.roles
      .map((ur: any) => {
        if (!ur.role) return null;
        return {
          id: ur.role.id,
          name: ur.role.name,
          description: ur.role.description,
          permissions: ur.role.permissions.map((rp: any) => rp.permission.code),
        };
      })
      .filter(Boolean);

    // 5️⃣ Réponse finale
    return res.status(200).json(
      Utilities.successReponse(200, "Connexion réussie", {
        token: {
          accessToken,
          refreshToken,
        },
        user: {
          id_user: user.id,
          name: user.name,
          userName: user.userName,
          email: user.email,
          phone: user.phone,
          roles: userRoles,
          password: user.password,
        },
      }),
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
      { expiresIn: "1h" },
    );

    return res.status(200).json(
      Utilities.successReponse(200, "Nouveau token généré", {
        accessToken: newAccessToken,
      }),
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
  next: NextFunction,
) => {
  try {
    const data = req.body;

    const where = {
      email: data.email,
      userName: data.userName,
    };

    // 1️⃣ Vérifier si l'email existe déjà ou le userName
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email, userName: data.userName, phone: data.phone },
    });

    if (existingUser) {
      return res
        .status(409)
        .json(
          Utilities.errorResponse(
            409,
            "Email ou userName existant ou numero deja enregistré.",
          ),
        );
    }

    // 2️⃣ Vérification mot de passe + confirmation
    if (data.password !== data.passwordConfirmation) {
      return res
        .status(400)
        .json(
          Utilities.errorResponse(
            400,
            "Les mots de passe ne correspondent pas.",
          ),
        );
    }

    // 3️⃣ Hash du mot de passe
    const hashedPassword = await Utilities.hashPassword(data.password);

    // 4️⃣ Gérer l'upload de la photo
    let profilePhoto = "/uploads/default_profile.png";
    if (req.files?.photo) {
      profilePhoto = await Utilities.saveFile(
        req.files.photo as any,
        "uploads/profiles",
      );
      profilePhoto = Utilities.resolveFileUrl(req, profilePhoto);
    }

    // 5️⃣ Création utilisateur (LOCAL)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        userName: data.userName,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        photo: profilePhoto,

        // 🔐 Auth
        provider: "LOCAL",
        emailVerified: false,
        status: "active",
      },
    });

    // Générer token temporaire pour vérification email
    const tempToken = jwt.sign(
      { id_user: user.id, scope: "verify-email" },
      process.env.JWT_SECRET!,
      { expiresIn: "10m" },
    );

    // 6️⃣ Attribution rôle admin si éligible
    await assignSuperAdminIfEligible(user.id);

    // ⚠️ Pas d’OTP ici
    // L’OTP est envoyé via /send-email-verification-otp

    // 7️⃣ Nettoyage données sensibles
    const safeUser = {
      id_user: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    return res
      .status(201)
      .json(
        Utilities.successReponse(
          201,
          "Compte créé avec succès. Vérifiez votre email.",
          { user: safeUser, token: tempToken },
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const sendEmailVerificationOTP = async (req: Request, res: Response) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res
        .status(401)
        .json(Utilities.errorResponse(401, "Email requis."));
    }

    // 1️⃣ Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res
        .status(404)
        .json(Utilities.errorResponse(404, "Utilisateur introuvable."));
    }

    // 🔐 Refuser Google
    if (user.provider !== "LOCAL") {
      return res
        .status(400)
        .json(
          Utilities.errorResponse(
            400,
            "La vérification email n'est pas requise pour les comptes Google.",
          ),
        );
    }

    // 📧 Déjà vérifié
    if (user.emailVerified) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Email déjà vérifié."));
    }

    // 2️⃣ Génération OTP sécurisé (6 chiffres)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Expiration (10 minutes)
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4️⃣ Sauvegarde OTP
    await prisma.user.update({
      where: { email: email },
      data: {
        otp,
        otpExpiresAt,
      },
    });

    // 5️⃣ Envoi email
    await sendMail({
      to: user.email,
      name: user.name,
      type: "verifyEmail",
      otp: Number(otp),
      subject: "Vérifiez votre adresse email",
    });

    return res
      .status(200)
      .json(
        Utilities.successReponse(
          200,
          "Code de vérification envoyé par email.",
          {},
        ),
      );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(Utilities.errorResponse(500, "Erreur interne du serveur."));
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
  next: NextFunction,
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

    return res
      .status(200)
      .json(
        Utilities.successReponse(
          200,
          "Email de réinitialisation envoyé ! Veuillez vérifier votre boîte de réception.",
          {},
        ),
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
  expiresAt: Date,
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      otp,
      otpExpiresAt: expiresAt,
    },
  });
};
//fonction pour verifier si le code otp envoyé a l'utilisateur correspond a celui entre par l'utilisateur
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.secretOtp) {
    res
      .status(409)
      .json(Utilities.errorResponse(404, "Utilisateur ou secret OTP invalide"));
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
    res
      .status(409)
      .json(Utilities.errorResponse(400, "OTP invalide ou expiré"));
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

//fonction pour verifier le code otp pour la verification de l'email
export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { otp, email } = req.body; // ✅ Ajout de l'email

    if (!otp || !email) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Code OTP et email requis."));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(404)
        .json(Utilities.errorResponse(404, "Utilisateur non trouvé."));
    }

    // 🔐 Refuser Google
    if (user.provider !== "LOCAL") {
      return res
        .status(400)
        .json(
          Utilities.errorResponse(
            400,
            "La vérification email n'est pas requise pour les comptes Google.",
          ),
        );
    }

    // 📧 Déjà vérifié
    if (user.emailVerified === true) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Email déjà vérifié."));
    }

    // ⏱ OTP manquant ou expiré
    if (!user.otp || !user.otpExpiresAt) {
      return res
        .status(400)
        .json(
          Utilities.errorResponse(
            400,
            "Code OTP expiré. Veuillez en demander un nouveau.",
          ),
        );
    }

    if (user.otpExpiresAt < new Date()) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Code OTP expiré."));
    }

    // 🔢 Comparaison OTP
    if (user.otp !== String(otp)) {
      return res
        .status(400)
        .json(Utilities.errorResponse(400, "Code OTP incorrect."));
    }

    // 2️⃣ Validation email + nettoyage OTP
    await prisma.user.update({
      where: { id: user.id }, // ✅ Utiliser user.id récupéré
      data: {
        emailVerified: true,
        otp: null,
        otpExpiresAt: null,
        secretOtp: null,
      },
    });

    return res
      .status(200)
      .json(Utilities.successReponse(200, "Email vérifié avec succès.", {}));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(Utilities.errorResponse(500, "Erreur interne du serveur."));
  }
};

//fonction pour renvoyer un nouveau code otp a l'utilisateur
export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    res
      .status(404)
      .json(Utilities.errorResponse(404, "Utilisateur introuvable."));
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
  });
};

interface UpdatePasswordBody {
  email: string;
  otp: string;
  newPassword: string;
}

export const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordBody>,
  res: Response,
  next: NextFunction,
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
    if (
      !user.otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < now ||
      user.otp !== otp
    ) {
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
      .json(
        Utilities.successReponse(
          200,
          "Mot de passe mis à jour avec succès.",
          updatedUser,
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user?.id_user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non rencontré." });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ message: "Mot de passe actuel incorrect." });
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
      .json(
        Utilities.successReponse(
          200,
          "Mot de passe mis à jour avec succès.",
          updatedUser,
        ),
      );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Récupéré par ton middleware protect/auth

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        userName: true,
        photo: true,
        defaultFarmId: true,
        // ✅ On récupère les rôles système
        roles: {
          include: {
            role: true,
          },
        },
        // ✅ On récupère les organisations dont il est membre
        memberOrganizations: {
          select: {
            id: true,
            name: true,
            ownerId: true,
          },
        },
        // ✅ On récupère aussi celles qu'il possède
        ownedOrganizations: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // On aplatit un peu la structure pour le frontend
    const formattedUser = {
      ...user,
      roles: user.roles.map((r) => r.role.name), // ["ORGANIZATION_OWNER", "USER"]
    };

    res.status(200).json({ data: formattedUser });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

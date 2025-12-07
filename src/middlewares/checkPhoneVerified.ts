// import prisma from "../models/prismaClient.js";
// import twilio from "twilio";
// import crypto from "crypto";

// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// export const sendPhoneVerificationOTP = async (req, res) => {
//   try {
//     const userId = (req as any).user?.id_user;

//     const user = await prisma.user.findUnique({ where: { id: userId } });

//     if (!user || !user.phone) {
//       return res.status(400).json({ message: "Numéro de téléphone non trouvé." });
//     }

//     // Génération OTP
//     const otp = String(Math.floor(100000 + Math.random() * 900000));
//     const secret = crypto.randomBytes(32).toString("hex");

//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         otp,
//         secretOtp: secret,
//         otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
//       },
//     });

//     // Envoi SMS
//     await client.messages.create({
//       body: `Votre code OTP AgroPulse est : ${otp}. Il expire dans 10 minutes.`,
//       from: process.env.TWILIO_PHONE,
//       to: user.phone,
//     });

//     res.json({ message: "OTP envoyé par SMS." });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Erreur interne." });
//   }
// };


// export const verifyPhoneOTP = async (req, res) => {
//   try {
//     const { otp } = req.body;
//     const userId = (req as any).user?.id_user;

//     const user = await prisma.user.findUnique({ where: { id: userId } });

//     if (!user) {
//       return res.status(404).json({ message: "Utilisateur non trouvé." });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ message: "OTP incorrect." });
//     }

//     if (user.otpExpiresAt < new Date()) {
//       return res.status(400).json({ message: "OTP expiré." });
//     }

//     await prisma.user.update({
//       where: { id: userId },
//       data: {
//         phoneVerified: true,
//         otp: null,
//         secretOtp: null,
//         otpExpiresAt: null,
//       },
//     });

//     return res.json({ message: "Numéro vérifié avec succès !" });
//   } catch (error) {
//     res.status(500).json({ message: "Erreur interne." });
//   }
// };



// export const checkPhoneVerified = async (req, res, next) => {
//   try {
//     const userId = (req as any).user?.id_user;

//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: { phoneVerified: true },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "Utilisateur non trouvé." });
//     }

//     if (!user.phoneVerified) {
//       return res.status(403).json({
//         message: "Vous devez vérifier votre numéro de téléphone."
//       });
//     }

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

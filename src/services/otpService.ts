// import prisma from "../models/prismaClient.js";

// import { sendMail } from "../services/mail.service.js";

// import crypto from "crypto";

// export const sendEmailVerificationOTP_INTERNAL = async (userId: number) => {
//   const otp = String(Math.floor(100000 + Math.random() * 900000));
//   const secret = crypto.randomBytes(32).toString("hex");

//   await prisma.user.update({
//     where: { id: userId },
//     data: {
//       otp,
//       secretOtp: secret,
//       otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
//     },
//   });

//   const user = await prisma.user.findUnique({ where: { id: userId } });

//   if (user?.email) {
//     await sendMail({
//       to: user.email,
//       name: user.name,
//       type: "verifyEmail",
//       otp: Number(otp),
//       subject: "Vérifiez votre email",
//     });
//   }
// };

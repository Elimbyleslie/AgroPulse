import nodemailer from "nodemailer";
import env from "../config/env.js";

 

export const transporter = nodemailer.createTransport({
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
} as unknown as nodemailer.TransportOptions);

type MailType = "welcome" | "resetPassword" | "alert"| "verifyEmail" ;

interface MailOptions {
  to: string;
  name?: string;
  otp?: number;//pour resetPassword 
  link?: string; //   confirmation
  subject: string;
  type: MailType;
}

export const getHtmlTemplate = (type: MailType, name?: string, otp?: string, link?:string) => {
  switch (type) {
    case "welcome":
      return `<h1>Bonjour ${name}!</h1>
              <p>Bienvenue sur <b>AgroPulse</b> 🌿. Nous sommes ravis de vous compter parmi nous !</p>
              <p> Merci de rejoindre notre communauté dédiée à l'agriculture durable et innovante.<p>
              <p> À bientôt sur AgroPulse !</p>
           `;         
    case "resetPassword":
      return `<h1>Bonjour ${name}!</h1>
              <p>Vous avez demandé une réinitialisation de mot de passe.</p>
              <p> Utilisez ce code pour réinitialiser votre mot de passe ${otp}`;
    case "alert":
      return `<h1>Notification AgroPulse</h1>
              <p>${name}, vous avez une nouvelle alerte importante.</p>`;
    case "verifyEmail":
      return `<h1>Bonjour ${name}!</h1>
              <p>Merci de vous être inscrit sur <b>AgroPulse</b> 🌿.</p>
              <p> veuillez confirmez votre en utilisant ce code : ${otp} </p>
           `; 
    default:
      return `<p>Message AgroPulse</p>`;
  }
};

export const sendMail = async ({ to, name, otp, link, type }: MailOptions) => {
  try {
    await transporter.sendMail({
      from: `"AgroPulse" <${env.mailUser}>`,
      to,
      subject:
        type === "welcome"
          ? "Bienvenue sur AgroPulse 🌿"
          : type === "resetPassword"
          ? "Code de réinitialisation"
          : "Notification AgroPulse",

      html: getHtmlTemplate(type, name, otp?.toString(), link),
    });

    console.log(`Email "${type}" envoyé à ${to}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi du mail :", error);
  }
};





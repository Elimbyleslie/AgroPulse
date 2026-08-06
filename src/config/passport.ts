import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Request, Response } from "express";
import prisma from "../models/prismaClient.js";
import jwt from "jsonwebtoken";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) return done(null, false);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              userName: profile.displayName.replace(/\s+/g, ""),
              password: "",
              emailVerified: true,
              provider: "GOOGLE",
            },
          });
        }

     
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
          expiresIn: "7d",
        });

        return done(null, { ...user, token } as any);
      } catch (error) {
        done(error as Error, false);
      }
    },
  ),
);

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.resolve('./.env'),
});

const env = {
  nodeProduction: process.env.NODE_PRODUCTION === 'true',
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV || 'production',
  hostname: process.env.HOST || '127.0.0.1',

  dbHost: process.env.DATABASE_HOST,
  dbUser: process.env.DATABASE_USER,
  dbPasword: process.env.DATABASE_PASSWORD,
  dbName: process.env.DATABASE_NAME,

  mailUser: process.env.MAIL_USER,
  mailPassword: process.env.MAIL_PASSWORD || 'app_password123',
  mailHost: process.env.MAIL_HOST || 'localhost',
  mailPort: process.env.MAIL_PORT || '1025',
  mailSecure: process.env.MAIL_SECURE || false,

  accessTokenSecretKey: process.env.JWT_SECRET || '',
  refreshTokenSecretKey: process.env.REFRESH_JWT_SECRET || '',
  accessTokenSecretKeyExpireIn: process.env.JWT_SECRET_EXPIRE_IN || '1h',
  refreshTokenSecretKeyExpireIn: process.env.REFRESH_JWT_SECRET_EXPIRE_IN || '7d',

  allowOrigins:
    (process.env.ALL_ORIGINS && JSON.parse(process.env.ALL_ORIGINS)) || [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
};

export default env;

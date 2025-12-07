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
  mailUser: process.env.MAIL_USER ,
  mailPassword: process.env.MAIL_PASSWORD || 'app_password123',
  mailHost: process.env.MAIL_HOST || 'localhost',
  mailPort: process.env.MAIL_PORT || '1025',
  mailSecure: process.env.MAIL_SECURE || false,
  accessTokenSecretKey: process.env.JWT_SECRET || '',
  refreshTokenSecretKey: process.env.REFRESH_JWT_SECRET || '',
  accessTokenSecretKeyExpireIn: process.env.JWT_SECRET_EXPIRE_IN || '1h' ,
  refreshTokenSecretKeyExpireIn: process.env.REFRESH_JWT_SECRET_EXPIRE_IN || '7d',
  allowOrigins: (process.env.ALL_ORIGINS && JSON.parse(process.env.ALL_ORIGINS)) || [`http://127.0.0.1:3000`],
};

if (!env.port) {
  throw new Error('Missing required environment variable: PORT');
}

if (!env.hostname) {
  throw new Error('Missing required environment variable: DB_HOST');
}

if (!env.accessTokenSecretKey) {
  throw new Error('Missing required environment variable: JWT_SECRET');
}

if (!env.refreshTokenSecretKey) {
  throw new Error('Missing required environment variable: REFRESH_JWT_SECRET');
}

if (!env.accessTokenSecretKeyExpireIn) {
  throw new Error('Missing required environment variable: JWT_SECRET_EXPIRE_IN');
}

if (!env.refreshTokenSecretKeyExpireIn) {
  throw new Error('Missing required environment variable: REFRESH_JWT_SECRET_EXPIRE_IN');
}
export default env;

import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const v = process.env[key];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return v;
};

const optional = (key: string, def: string): string => process.env[key] ?? def;

const nodeEnv = optional('NODE_ENV', 'development');

export const env = {
  nodeEnv,
  isDev: nodeEnv === 'development',
  isProd: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: parseInt(optional('PORT', '4000'), 10),
  databaseUrl: required('DATABASE_URL'),
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: optional('JWT_ACCESS_EXPIRES_IN', '15m'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '7d'),
  },
  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME', ''),
    apiKey: optional('CLOUDINARY_API_KEY', ''),
    apiSecret: optional('CLOUDINARY_API_SECRET', ''),
  },
  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  },
  cors: {
    origin: optional('CORS_ORIGIN', '*'),
  },
  bcrypt: {
    saltRounds: parseInt(optional('BCRYPT_SALT_ROUNDS', '10'), 10),
  },
  log: {
    level: optional('LOG_LEVEL', nodeEnv === 'production' ? 'info' : 'debug'),
  },
} as const;

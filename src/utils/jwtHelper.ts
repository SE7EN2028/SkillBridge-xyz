import jwt, { type SignOptions, type JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import type { Role } from '@prisma/client';
import { env } from '../config/env';
import { UnauthorizedError } from './appError';

export interface JwtPayload {
  sub: string;
  role: Role;
}

const sign = (payload: JwtPayload, secret: string, expiresIn: string): string =>
  jwt.sign({ ...payload, jti: randomUUID() }, secret, { expiresIn } as SignOptions);

const verify = (token: string, secret: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, secret) as DefaultJwtPayload & Partial<JwtPayload>;
    if (typeof decoded.sub !== 'string' || !decoded.role) {
      throw new UnauthorizedError('Invalid token payload');
    }
    return { sub: decoded.sub, role: decoded.role };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const jwtHelper = {
  signAccessToken: (payload: JwtPayload): string =>
    sign(payload, env.jwt.accessSecret, env.jwt.accessExpiresIn),
  signRefreshToken: (payload: JwtPayload): string =>
    sign(payload, env.jwt.refreshSecret, env.jwt.refreshExpiresIn),
  verifyAccessToken: (token: string): JwtPayload => verify(token, env.jwt.accessSecret),
  verifyRefreshToken: (token: string): JwtPayload => verify(token, env.jwt.refreshSecret),
};

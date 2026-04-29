import type { PrismaClient, RefreshToken } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';

export interface IRefreshTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken>;
  findByHash(tokenHash: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}

export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  create(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken> {
    return this.db.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  findByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.db.refreshToken.findUnique({ where: { tokenHash } });
  }

  async revoke(id: string): Promise<void> {
    await this.db.refreshToken.update({ where: { id }, data: { revoked: true } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();

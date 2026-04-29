import type { User } from '@prisma/client';
import { userRepository, type IUserRepository } from '../repositories/userRepository';
import {
  refreshTokenRepository,
  type IRefreshTokenRepository,
} from '../repositories/refreshTokenRepository';
import { hashPassword, comparePassword, sha256 } from '../utils/hashHelper';
import { jwtHelper } from '../utils/jwtHelper';
import { ConflictError, UnauthorizedError } from '../utils/appError';
import { env } from '../config/env';
import type { RegisterDTO, LoginDTO, AuthResponse, TokenPair } from '../types/auth.types';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  constructor(
    private readonly users: IUserRepository = userRepository,
    private readonly refreshTokens: IRefreshTokenRepository = refreshTokenRepository,
  ) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const email = data.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await hashPassword(data.password);
    const user = await this.users.create({
      name: data.name,
      email,
      passwordHash,
      role: data.role,
    });

    return this.buildAuthResponse(user);
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.users.findByEmail(data.email);
    if (!user || !user.isActive) throw new UnauthorizedError('Invalid credentials');

    const ok = await comparePassword(data.password, user.passwordHash);
    if (!ok) throw new UnauthorizedError('Invalid credentials');

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = jwtHelper.verifyRefreshToken(refreshToken);
    const tokenHash = sha256(refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    await this.refreshTokens.revoke(stored.id);

    const user = await this.users.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError('User not found');

    const tokens = await this.issueTokens(user);
    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = sha256(refreshToken);
    const stored = await this.refreshTokens.findByHash(tokenHash);
    if (stored && !stored.revoked) {
      await this.refreshTokens.revoke(stored.id);
    }
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.issueTokens(user);
    return {
      ...tokens,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }

  private async issueTokens(user: User): Promise<TokenPair> {
    const payload = { sub: user.id, role: user.role };
    const accessToken = jwtHelper.signAccessToken(payload);
    const refreshToken = jwtHelper.signRefreshToken(payload);
    await this.refreshTokens.create(
      user.id,
      sha256(refreshToken),
      new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    );
    void env;
    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();
